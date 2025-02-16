import React, { useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("your-stripe-public-key");

declare global {
    interface Window {
        paypal: any;
    }
}

const DonationForm: React.FC = () => {
    useEffect(() => {
        const paypalScript = document.createElement("script");
        paypalScript.src = "https://www.paypal.com/sdk/js?client-id=your-paypal-client-id&currency=EUR";
        paypalScript.onload = () => {
            window.paypal.Buttons({
                createOrder: (data: any, actions: any) => {
                    return actions.order.create({
                        purchase_units: [{ amount: { value: "10.00" } }]
                    });
                },
                onApprove: (data: any, actions: any) => {
                    return actions.order.capture().then((details: any) => {
                        alert("Transaction completed by " + details.payer.name.given_name);
                    });
                }
            }).render("#paypal-button-container");
        };
        document.body.appendChild(paypalScript);
    }, []);

    const handleStripePayment = async () => {
        const stripe = await stripePromise;
        if (!stripe) return;
        const { error } = await stripe.redirectToCheckout({
            lineItems: [{ price: "your-stripe-price-id", quantity: 1 }],
            mode: "payment",
            successUrl: "https://your-site.com/success",
            cancelUrl: "https://your-site.com/cancel"
        });
        if (error) console.error(error);
    };

    return (
        <div>
            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleStripePayment}>
                Mit Kreditkarte oder Google Pay zahlen
            </button>
            <div id="paypal-button-container" className="mt-4"></div>
        </div>
    );
};

export default DonationForm;
