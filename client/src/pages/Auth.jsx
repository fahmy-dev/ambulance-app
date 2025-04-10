// import React, { useState } from "react";
// import { Formik, Form, Field, ErrorMessage } from "formik";
// import * as Yup from "yup";

// function Auth() {
//   const [isLogin, setIsLogin] = useState(true);

//   const toggleForm = () => setIsLogin((prev) => !prev);

//   const loginInitialValues = { email: "", password: "" };
//   const registerInitialValues = { name: "", email: "", password: "", confirmPassword: "" };

//   const loginSchema = Yup.object({
//     email: Yup.string().email("Invalid email").required("Email is required"),
//     password: Yup.string().required("Password is required"),
//   });

//   const registerSchema = Yup.object({
//     name: Yup.string().required("Full name is required"),
//     email: Yup.string().email("Invalid email").required("Email is required"),
//     password: Yup.string().min(6, "Min 6 characters").required("Password is required"),
//     confirmPassword: Yup.string()
//       .oneOf([Yup.ref("password"), null], "Passwords must match")
//       .required("Confirm your password"),
//   });

//   const handleSubmit = (values) => {
//     console.log(isLogin ? "Logging in with:" : "Registering with:", values);
//     // Hook into backend here
//   };

//   return (
//     <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow-md">
//       <div className="flex justify-around mb-6">
//         <button
//           onClick={() => setIsLogin(true)}
//           className={`px-4 py-2 rounded font-semibold ${
//             isLogin ? "bg-blue-600 text-white" : "bg-gray-200"
//           }`}
//         >
//           Login
//         </button>
//         <button
//           onClick={() => setIsLogin(false)}
//           className={`px-4 py-2 rounded font-semibold ${
//             !isLogin ? "bg-green-600 text-white" : "bg-gray-200"
//           }`}
//         >
//           Register
//         </button>
//       </div>

//       <h2 className="text-2xl font-bold mb-4 text-center">
//         {isLogin ? "Login to Your Account" : "Create a New Account"}
//       </h2>

//       <Formik
//         initialValues={isLogin ? loginInitialValues : registerInitialValues}
//         validationSchema={isLogin ? loginSchema : registerSchema}
//         onSubmit={handleSubmit}
//       >
//         <Form className="space-y-4">
//           {!isLogin && (
//             <div>
//               <label className="block text-sm font-medium">Full Name</label>
//               <Field name="name" placeholder="Jane Doe" className="w-full p-2 border rounded" />
//               <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
//             </div>
//           )}

//           <div>
//             <label className="block text-sm font-medium">Email</label>
//             <Field name="email" type="email" placeholder="you@example.com" className="w-full p-2 border rounded" />
//             <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
//           </div>

//           <div>
//             <label className="block text-sm font-medium">Password</label>
//             <Field name="password" type="password" placeholder="••••••••" className="w-full p-2 border rounded" />
//             <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
//           </div>

//           {!isLogin && (
//             <div>
//               <label className="block text-sm font-medium">Confirm Password</label>
//               <Field
//                 name="confirmPassword"
//                 type="password"
//                 placeholder="••••••••"
//                 className="w-full p-2 border rounded"
//               />
//               <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-sm" />
//             </div>
//           )}

//           <button
//             type="submit"
//             className={`w-full ${
//               isLogin ? "bg-blue-600" : "bg-green-600"
//             } text-white p-2 rounded hover:opacity-90`}
//           >
//             {isLogin ? "Login" : "Register"}
//           </button>
//         </Form>
//       </Formik>
//     </div>
//   );
// }

// export default Auth;


import React from "react";
import { useLocation } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

function Auth() {
  const location = useLocation();
  const mode = location.state?.mode || "login"; // default to login

  const isLogin = mode === "login";

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

  const handleSubmit = (values) => {
    console.log(isLogin ? "Logging in:" : "Registering:", values);
    // connect to backend here
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">
        {isLogin ? "Login to Your Account" : "Create a New Account"}
      </h2>

      <Formik
        initialValues={isLogin ? loginInitialValues : registerInitialValues}
        validationSchema={isLogin ? loginSchema : registerSchema}
        onSubmit={handleSubmit}
      >
        <Form className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium">Full Name</label>
              <Field name="name" placeholder="Jane Doe" className="w-full p-2 border rounded" />
              <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">Email</label>
            <Field name="email" type="email" placeholder="you@example.com" className="w-full p-2 border rounded" />
            <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium">Password</label>
            <Field name="password" type="password" placeholder="••••••••" className="w-full p-2 border rounded" />
            <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium">Confirm Password</label>
              <Field
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="w-full p-2 border rounded"
              />
              <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-sm" />
            </div>
          )}

          <button
            type="submit"
            className={`w-full ${
              isLogin ? "bg-blue-600" : "bg-green-600"
            } text-white p-2 rounded hover:opacity-90`}
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </Form>
      </Formik>
    </div>
  );
}

export default Auth;
