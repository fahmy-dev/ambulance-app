import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";

function ContactUs() {
  const initialValues = {
    name: "",
    phone: "",
    email: "",
    message: ""
  };

  const validate = values => {
    const errors = {};
    
    if (!values.name) {
      errors.name = "Name is required";
    }
    
    if (!values.phone) {
      errors.phone = "Phone number is required";
    }
    
    if (!values.email) {
      errors.email = "Email is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = "Invalid email address";
    }
    
    if (!values.message) {
      errors.message = "Message is required";
    }
    
    return errors;
  };

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    console.log("Form submitted:", values);
    // Here you would typically send the data to your backend
    setTimeout(() => {
      alert("Thank you for contacting us! We will get back to you soon.");
      setSubmitting(false);
      resetForm();
    }, 1000);
  };

  return (
    <div className="contact-page">
      <h1 className="contact-title">Contact Us</h1>
      <p className="contact-subtitle">We'd love to hear from you</p>
      
      <Formik
        initialValues={initialValues}
        validate={validate}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <Field 
                type="text" 
                id="name" 
                name="name" 
                placeholder="Value" 
              />
              <ErrorMessage name="name" component="div" className="error-message" />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <Field 
                type="tel" 
                id="phone" 
                name="phone" 
                placeholder="Value" 
              />
              <ErrorMessage name="phone" component="div" className="error-message" />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <Field 
                type="email" 
                id="email" 
                name="email" 
                placeholder="Value" 
              />
              <ErrorMessage name="email" component="div" className="error-message" />
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <Field 
                as="textarea" 
                id="message" 
                name="message" 
                placeholder="Value" 
                rows="4"
              />
              <ErrorMessage name="message" component="div" className="error-message" />
            </div>
            
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default ContactUs;
