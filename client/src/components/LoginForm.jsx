import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

function LoginForm({ onSubmit, formError }) {
  const loginSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const initialValues = { email: "", password: "" };

  return (
    <div className="auth-form">
      <div className="auth-header">
        <h2>Login to Your Account</h2>
        <p>Welcome back! Please enter your details</p>
      </div>
      
      {formError && (
        <div className="error-message">
          {formError}
        </div>
      )}
      
      <Formik
        initialValues={initialValues}
        validationSchema={loginSchema}
        onSubmit={onSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <Field name="email" id="email" type="email" placeholder="you@example.com" />
              <ErrorMessage name="email" component="div" className="form-error" />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <Field name="password" id="password" type="password" placeholder="••••••••" />
              <ErrorMessage name="password" component="div" className="form-error" />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="sign-in-btn"
            >
              {isSubmitting ? "Processing..." : "Login"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default LoginForm;