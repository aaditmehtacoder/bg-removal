// client/src/pages/BuyCredit.jsx

import React, { useEffect } from "react";
import { assets, plans } from "../assets/assets";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";

function BuyCredit() {
  const { getToken } = useAuth();

  // Load PayPal SDK once
  useEffect(() => {
    const tag = document.createElement("script");
    tag.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}`;
    tag.async = true;
    tag.onload = renderButtons;
    document.body.appendChild(tag);
  }, []);

  // Render one PayPal button per plan
  const renderButtons = () => {
    if (!window.paypal) {
      toast.error("Failed to load PayPal SDK");
      return;
    }
    plans.forEach((plan, i) => {
      const containerId = `paypal-btn-container-${i}`;
      const container = document.getElementById(containerId);
      if (!container || container.childNodes.length) return;

      window.paypal
        .Buttons({
          style: { layout: "vertical", shape: "rect" },

          // 1) Create the order on your server
          createOrder: async () => {
            try {
              const token = await getToken();
              const { data } = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/paypal/create-order`,
                { plan: plan.id },
                { headers: { token } }
              );
              return data.id;
            } catch (err) {
              console.error("createOrder error", err);
              toast.error("Could not start payment: " + err.message);
            }
          },

          // 2) Capture the order & top up credits
          onApprove: async (data) => {
            try {
              const token = await getToken();
              const { data: resp } = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/paypal/capture-order`,
                { orderID: data.orderID, plan: plan.id },
                { headers: { token } }
              );
              if (resp.success) {
                toast.success("Purchase successful! Credits added.");
                // Optionally refresh your credit state here
                setTimeout(() => window.location.reload(), 1500);
              } else {
                toast.error("Purchase failed: " + (resp.message || ""));
              }
            } catch (err) {
              console.error("onApprove error", err);
              toast.error("Error capturing payment: " + err.message);
            }
          },

          // 3) Handle errors
          onError: (err) => {
            console.error("PayPal error", err);
            toast.error("Payment error, please try again.");
          },
        })
        .render(`#${containerId}`);
    });
  };

  return (
    <div className="min-h-[80vh] text-center pt-14 mb-10">
      <button className="border border-gray-400 px-10 py-2 rounded-full mb-6">
        Our Plans
      </button>
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-400 mb-10">
        Choose the plan that&rsquo;s right for you
      </h1>
      <div className="flex flex-wrap justify-center gap-6">
        {plans.map((item, index) => (
          <div
            key={index}
            className="bg-white drop-shadow-sm border rounded-lg py-12 px-8 text-gray-700 hover:scale-105 transition-all duration-700"
          >
            <img width={40} src={assets.logo_icon} alt="" />
            <p className="mt-3 font-semibold">{item.id}</p>
            <p className="text-sm">{item.desc}</p>
            <p className="mt-6">
              <span className="text-3xl font-medium">${item.price}</span>/
              {item.credits} credits
            </p>
            {/* PayPal button will appear here */}
            <div
              id={`paypal-btn-container-${index}`}
              className="mt-8"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default BuyCredit;
