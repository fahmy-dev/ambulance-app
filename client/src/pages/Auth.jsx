import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAuth } from "../context/AuthContext";

function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register, user } = useAuth();
  const [isLogin, setIsLogin] = useState(location.state?.mode !== "register");
  const [formError, setFormError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  const toggleForm = () => setIsLogin(prev => !prev);

  const loginInitialValues = { email: "", password: "" };
  const registerInitialValues = { name: "", email: "", password: "", confirmPassword: "" };

  const loginSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const registerSchema = Yup.object({
    name: Yup.string().required("Full name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().min(6, "Min 6 characters").required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm your password"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    setFormError("");
    try {
      if (isLogin) {
        // Login logic
        console.log("Attempting login with:", values.email);
        const user = await login({
          email: values.email,
          password: values.password
        });
        
        if (user) {
          navigate("/home");
        } else {
          setFormError("Invalid email or password.");
        }
      } else {
        // Register logic
        console.log("Attempting registration with:", values.email);
        const user = await register({
          name: values.name,
          email: values.email,
          password: values.password
        });
        
        if (user) {
          navigate("/home");
        } else {
          setFormError("Registration failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      setFormError("Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-tabs">
        <button
          onClick={() => setIsLogin(true)}
          className={`auth-tab ${isLogin ? 'active' : ''}`}
        >
          Login
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={`auth-tab ${!isLogin ? 'active' : ''}`}
        >
          Register
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-4 text-center">
        {isLogin ? "Login to Your Account" : "Create a New Account"}
      </h2>

      {formError && (
        <div className="form-error mb-4">{formError}</div>
      )}

      <Formik
        initialValues={isLogin ? loginInitialValues : registerInitialValues}
        validationSchema={isLogin ? loginSchema : registerSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <Field name="name" placeholder="Jane Doe" className="form-input" />
                <ErrorMessage name="name" component="div" className="form-error" />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email</label>
              <Field name="email" type="email" placeholder="you@example.com" className="form-input" />
              <ErrorMessage name="email" component="div" className="form-error" />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <Field name="password" type="password" placeholder="••••••••" className="form-input" />
              <ErrorMessage name="password" component="div" className="form-error" />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <Field
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="form-input"
                />
                <ErrorMessage name="confirmPassword" component="div" className="form-error" />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`form-button ${isLogin ? "login-btn" : "register-btn"}`}
            >
              {isSubmitting ? "Processing..." : isLogin ? "Login" : "Register"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default Auth;
