import React from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import { router } from "@/router"
import { ToastContainer } from "react-toastify"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router}>
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      style={{ zIndex: 9999 }}
    />
  </RouterProvider>
)