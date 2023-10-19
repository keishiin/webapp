use crate::{
    app_state::AppState,
    models::users::{ResponseUser, User, UserRequest},
    queries::users_q::{create_user, get_user_by_username},
    utils::{
        errors::ApiError,
        hash::{hash_password, verify_password},
        jwt_auth_utils::create_token,
        middware_utils::{get_header, split_by_double_quotes},
    },
};
use ::entity::users;
use axum::debug_handler;
use axum::http::HeaderMap;
use axum::{extract::State, http::StatusCode, Json};
use bb8::Pool;
use bb8_redis::RedisConnectionManager;
use hyper::header::COOKIE;
use redis::cmd;
use sea_orm::{DatabaseConnection, Set};
use uuid::Uuid;

#[debug_handler(state = AppState)]
pub async fn signup(
    State(db): State<DatabaseConnection>,
    State(redis_pool): State<Pool<RedisConnectionManager>>,
    req_user: Json<User>,
) -> Result<(HeaderMap, Json<ResponseUser>), ApiError> {
    let new_user = users::ActiveModel {
        id: Set(Uuid::new_v4().to_string()),
        user_name: Set(req_user.username.clone()),
        password: Set(hash_password(&req_user.password)?),
        email: Set(req_user.email.clone()),
        steam_id: Set(req_user.steam_id.clone()),
        psn_auth_code: Set(req_user.psn_auth_code.clone()),
        ..Default::default()
    };

    let user = create_user(&db, new_user).await?;
    let session_key = format!("user_{}", user.id);

    let token = create_token(session_key)?;
    let completed_token = format!("s.id={:?}", token.clone());

    let mut headers = HeaderMap::new();
    headers.insert("set-cookie", completed_token.parse().unwrap());

    let mut conn = redis_pool.get().await.unwrap();
    let _reply: redis::Value = cmd("SET")
        .arg(&[token, user.clone().id])
        .query_async(&mut *conn)
        .await
        .unwrap();

    let return_user = ResponseUser {
        id: user.clone().id,
        username: user.user_name,
        email: user.email,
        steam_id: user.steam_id,
        psn_auth_code: user.psn_auth_code,
    };

    Ok((headers, Json(return_user)))
}

#[debug_handler(state = AppState)]
pub async fn signin(
    State(db): State<DatabaseConnection>,
    State(redis_pool): State<Pool<RedisConnectionManager>>,
    user_info: Json<UserRequest>,
) -> Result<(HeaderMap, Json<ResponseUser>), ApiError> {
    let user = get_user_by_username(&db, user_info.username.clone()).await?;

    if !verify_password(&user_info.password, &user.password)? {
        return Err(ApiError::new(
            StatusCode::UNAUTHORIZED,
            "Incorrect username/password",
        ));
    }
    let session_key = format!("user_{}", user.id);
    let token = create_token(session_key)?;
    let completed_token = format!("s.id={:?}", token.clone());

    let mut headers = HeaderMap::new();
    headers.insert("set-cookie", completed_token.parse().unwrap());

    let mut conn = redis_pool.get().await.unwrap();
    let _reply: redis::Value = cmd("SET")
        .arg(&[token, user.clone().id])
        .query_async(&mut *conn)
        .await
        .unwrap();

    let return_user = ResponseUser {
        id: user.id,
        username: user.user_name,
        email: user.email,
        steam_id: user.steam_id,
        psn_auth_code: user.psn_auth_code,
    };

    Ok((headers, Json(return_user)))
}

#[debug_handler(state = AppState)]
pub async fn signout(
    State(redis_pool): State<Pool<RedisConnectionManager>>,
    headers: HeaderMap,
) -> Result<StatusCode, ApiError> {
    let header_token = get_header(headers, COOKIE.to_string())?;

    let value = split_by_double_quotes(header_token.as_str().clone())?;

    let mut conn = redis_pool.get().await.unwrap();
    let _reply: redis::Value = cmd("DEL").arg(value).query_async(&mut *conn).await.unwrap();

    Ok(StatusCode::OK)
}