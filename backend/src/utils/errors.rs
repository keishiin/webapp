use axum::{http::StatusCode, response::IntoResponse, Json};
use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq)]
pub struct ApiError {
    code: StatusCode,
    message: String,
}

impl ApiError {
    pub fn new(code: StatusCode, message: impl Into<String>) -> Self {
        Self {
            code,
            message: message.into(),
        }
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> axum::response::Response {
        (
            self.code,
            Json(ErrorResponse {
                error: self.message.clone(),
            }),
        )
            .into_response()
    }
}

#[derive(Serialize, Deserialize, Debug, PartialEq)]
pub struct ErrorResponse {
    pub error: String,
}
