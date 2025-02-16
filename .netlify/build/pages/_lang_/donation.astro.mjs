/* empty css                                          */
import { e as createComponent, r as renderTemplate, i as renderComponent, m as maybeRenderHead } from '../../chunks/astro/server_BpKjF3de.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../../chunks/Layout_lfss1_Pw.mjs';
import { $ as $$Header } from '../../chunks/Button_BpOTdgaY.mjs';
import { $ as $$Footer } from '../../chunks/Footer_CjTzBoZ1.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
export { renderers } from '../../renderers.mjs';

const stripePromise = loadStripe("your-stripe-public-key");
const DonationForm = () => {
  useEffect(() => {
    const paypalScript = document.createElement("script");
    paypalScript.src = "https://www.paypal.com/sdk/js?client-id=your-paypal-client-id&currency=EUR";
    paypalScript.onload = () => {
      window.paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{ amount: { value: "10.00" } }]
          });
        },
        onApprove: (data, actions) => {
          return actions.order.capture().then((details) => {
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
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("button", { className: "bg-blue-500 text-white px-4 py-2 rounded", onClick: handleStripePayment, children: "Mit Kreditkarte oder Google Pay zahlen" }),
    /* @__PURE__ */ jsx("div", { id: "paypal-button-container", className: "mt-4" })
  ] });
};

const $$Donation = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Spenden", "defaultPadding": true }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", $$Header, {})} ${maybeRenderHead()}<main class="min-h-screen bg-gradient-to-b from-white to-gray-50"> <div class="container mx-auto px-4 py-12"> <div class="mx-auto max-w-3xl text-center"> <h1 class="mb-6 text-4xl font-bold text-gray-800 md:text-5xl">
Gemeinsam für eine bessere Zukunft
</h1> <p class="mb-12 text-xl text-gray-600">
Ihre Unterstützung macht den Unterschied. Jede Spende hilft
					uns, Menschen mit ALS besser zu unterstützen.
</p> <div class="mb-12 rounded-lg bg-white p-8 shadow-xl"> ${renderComponent($$result2, "DonationForm", DonationForm, {})} </div> <div class="mt-12 grid gap-8 md:grid-cols-2"> <div class="rounded-lg bg-white p-6 shadow-md"> <h2 class="mb-6 text-2xl font-semibold text-gray-800">
Banküberweisung
</h2> <dl class="grid gap-4 text-left"> <div> <dt class="font-medium text-gray-600">IBAN</dt> <dd class="font-mono text-lg">
DE12345678901234567890
</dd> </div> <div> <dt class="font-medium text-gray-600">BIC</dt> <dd class="font-mono text-lg">GENODEF1S12</dd> </div> <div> <dt class="font-medium text-gray-600">
Empfänger
</dt> <dd class="text-lg">CV ALS e.V.</dd> </div> </dl> </div> <div class="rounded-lg bg-white p-6 shadow-md"> <h2 class="mb-4 text-2xl font-semibold text-gray-800">
Ihre Wirkung
</h2> <ul class="space-y-4 text-left text-gray-600"> <li class="flex items-start"> <svg class="mr-2 h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg>
Unterstützung von ALS-Betroffenen
</li> <li class="flex items-start"> <svg class="mr-2 h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg>
Förderung der Forschung
</li> <li class="flex items-start"> <svg class="mr-2 h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg>
Öffentlichkeitsarbeit
</li> </ul> </div> </div> </div> </div> </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "/home/flori/Prg_new/als/src/pages/[lang]/donation.astro", void 0);

const $$file = "/home/flori/Prg_new/als/src/pages/[lang]/donation.astro";
const $$url = "/[lang]/donation";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Donation,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
