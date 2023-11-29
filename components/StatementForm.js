import React from "react";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import { useState } from "react";

const ConsultingSchema = Yup.object().shape({
  start_date: Yup.date().required("Start Date is required"),
  end_date: Yup.date().required("End Date is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
});

export default function StatementForm() {
  const [showEmailSend, setShowEmailSend] = useState(false);
  const [message, setMessage] = useState("");
  const submitFunction = async (values) => {
    try {
      const res = await fetch("/api/form-submit", {
        body: JSON.stringify({
          ...values,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      // if (!res.ok) {
      //   throw new Error(`Failed to submit form: ${res.status}`);
      // }
      if (!res.ok) {
        console.log(`Failed to submit form: ${res.status}`);
      }
      console.log(res);
      const contentType = res.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const { error } = await res.json();
        if (error) {
          setMessage(error);
        }
      } else {
        console.warn("Unexpected response format:", contentType);
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      // setShowEmailSend(true);
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <>
      <div className={`formikForm__container ${showEmailSend ? "active" : ""}`}>
        <h1>Sign Up</h1>
        <Formik
          initialValues={{
            start_date: "",
            end_date: "",
            email: "",
          }}
          validationSchema={ConsultingSchema}
          onSubmit={async (values) => {
            await submitFunction(values);
          }}
        >
          <Form>
            <label htmlFor="start_date">Start Date</label>
            {/* add placeholder in both fields */}
            <Field id="start_date" name="start_date" type="date" />
            {/* placeholder="29-11-2023" */}
            <label htmlFor="end_date">End Date</label>
            <Field id="end_date" name="end_date" type="date" />

            <label htmlFor="email">Email</label>
            <Field
              id="email"
              name="email"
              placeholder="jane@acme.com"
              type="email"
            />
            <button type="submit">Submit</button>
            {message ? (
              <span className="error">{message}</span>
            ) : (
              <div>addddddddddddd</div>
            )}
          </Form>
        </Formik>
      </div>
      <div className={`formSuccess__overlay ${showEmailSend ? "active" : ""}`}>
        <div className="formSuccess__container">
          <h1>Thank you for your interest!</h1>
          <p>
            We will contact you shortly to discuss your project in more detail.
          </p>
        </div>
      </div>
    </>
  );
}
