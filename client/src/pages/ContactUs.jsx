import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import api from "../utils/api";

function ContactUs() {
  const [submitSuccess, setSubmitSuccess] = useState(false);
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
  
    if(!values.phone) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(values.phone)) {
      errors.phone = "Invalid phone number";
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

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const contactData = {
        name: values.name,
        email: values.email,
        phone_number: values.phone || "",
        message: values.message
      };
      
      await api.contactUs.create(contactData);
      
      setSubmitSuccess(true);
      resetForm();
      
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error) {
      console.error("Failed to submit contact form:", error);
      alert("Failed to submit your message. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <h1 className="contact-title">Contact Us</h1>
      <p className="contact-subtitle">We'd love to hear from you</p>
      
      {submitSuccess && (
        <div className="success-message">
          Thank you for contacting us! We will get back to you soon.
        </div>
      )}
      
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
                placeholder="Your name" 
              />
              <ErrorMessage name="name" component="div" className="error-message" />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <Field 
                type="tel" 
                id="phone" 
                name="phone" 
                placeholder="Your phone number" 
              />
              <ErrorMessage name="phone" component="div" className="error-message" />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <Field 
                type="email" 
                id="email" 
                name="email" 
                placeholder="Your email" 
              />
              <ErrorMessage name="email" component="div" className="error-message" />
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <Field 
                as="textarea" 
                id="message" 
                name="message" 
                placeholder="Your message" 
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
