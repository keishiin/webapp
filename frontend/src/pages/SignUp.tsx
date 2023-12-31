import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import apiClient from "../services/api-common";
import { isValidPassword, isValidEmail } from "../utils/regex_utils";

function SignUp() {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<CustomError | null>(null);
  const nav = useNavigate();

  const { mutate: postUser } = useMutation(
    async () => {
      return apiClient.post("auth/signup", {
        username: username,
        password: password,
        email: email,
      });
    },
    {
      onSuccess: () => {
        nav("/userProfile");
      },
      onError: (err) => {
        setError((err as any).response.data as CustomError);
      },
    },
  );

  const handleSubmit = (event: any) => {
    event.preventDefault();

    if (password !== passwordCheck) {
      setError({ error: "Passwords to dot match" });
      cleanUp(event);
      return;
    }

    if (!isValidPassword(password)) {
      setError({
        error:
          "Invalid password. Password must contain at least one uppercase letter, one lowercase letter, one digit, one special character, and be at least 8 characters long.",
      });
      cleanUp(event);
      return;
    }

    if (!isValidEmail(email)) {
      setError({ error: "Invalid email address. Please enter a valid email." });
      cleanUp(event);
      return;
    }

    try {
      postUser();
    } catch (err) {
      cleanUp(event);
      console.log(`Error: ${err}`);
    }
  };

  const cleanUp = (event: any) => {
    event.target.reset();

    setUserName("");
    setPassword("");
    setPasswordCheck("");
    setEmail("");
  };

  return (
    <div className="bg-gray-100 flex justify-center items-center h-screen">
      <div className="lg:p-36 md:p-52 sm:20 p-8 w-full lg:w-1/2">
        {error && (
          <div className="text-red-500 mt-2 text-center">{error.error}</div>
        )}
        <h1 className="text-2xl font-semibold mb-4">Sign Up</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-600">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
              onChange={(event) => setUserName(event.target.value)}
            ></input>
          </div>
          <div className="mb-4">
            <label className="block text-gray-600">Email</label>
            <input
              type="text"
              id="email"
              name="email"
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
              onChange={(event) => setEmail(event.target.value)}
            ></input>
          </div>
          <div className="mb-4">
            <label className="block text-gray-600">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
              onChange={(event) => setPassword(event.target.value)}
            ></input>
          </div>
          <div className="mb-4">
            <label className="block text-gray-600">Confirm Password</label>
            <input
              type="password"
              id="confrimPassword"
              name="confirmPassword"
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
              onChange={(event) => setPasswordCheck(event.target.value)}
            ></input>
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md py-2 px-4 w-full"
          >
            Sign Up
          </button>
        </form>
        <div className="mt-6 text-blue-500 text-center">
          <Link to="/login" className="hover:underline">
            Login
          </Link>
        </div>
        <div className="mt-6 text-blue-500 text-center">
          <Link to="/" className="hover:underline">
            Home
          </Link>
        </div>
      </div>
      <div className="w-1/2 h-screen hidden lg:block">
        <img
          src="../../images/photo-1698207873249-640dab81d84e.jpg"
          alt="Placeholder Image"
          className="object-cover w-full h-full"
        ></img>
      </div>
    </div>
  );
}

export default SignUp;
