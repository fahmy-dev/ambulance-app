import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

function SignupForm({ onSubmit, formError }) {
  const registerSchema = Yup.object({
    name: Yup.string().required("Full name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().min(6, "Min 6 characters").required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm your password"),
  });

  const initialValues = { name: "", email: "", password: "", confirmPassword: "" };

  return (
    <div className="auth-form">
      <div className="auth-header">
        <h2>Create a New Account</h2>
      </div>
      
      {formError && (
        <div className="error-message">
          {formError}
        </div>
      )}
      
      <Formik
        initialValues={initialValues}
        validationSchema={registerSchema}
        onSubmit={onSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <Field name="name" id="name" placeholder="Jane Doe" />
              <ErrorMessage name="name" component="div" className="form-error" />
            </div>

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

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <Field
                name="confirmPassword"
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
              />
              <ErrorMessage name="confirmPassword" component="div" className="form-error" />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="submit-btn"
            >
              {isSubmitting ? "Processing..." : "Register"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default SignupForm;