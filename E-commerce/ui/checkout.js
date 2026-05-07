// CheckoutButton.jsx  (or wherever your cart/checkout component is)

const handleCheckout = async () => {
  try {
    // ── STEP 1: Tell your backend to create a Razorpay order ──────────────
    const createRes = await fetch("http://localhost:8080/orders/create-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        totalAmount: totalAmount,          // e.g. 143999
        productQuantities: productQuantities  // e.g. { "5": 1 }
      }),
    });

    if (!createRes.ok) throw new Error("Failed to create payment order");

    const razorpayOrder = await createRes.json(); // has id, amount, currency

    // ── STEP 2: Open Razorpay checkout modal ──────────────────────────────
    const options = {
      key: "rzp_test_RJjGi87HbQY39o",   // your key_id from application.properties
      amount: razorpayOrder.amount,       // already in paise from backend
      currency: razorpayOrder.currency || "INR",
      name: "My Ecommerce Store",
      description: "Order Payment",
      order_id: razorpayOrder.id,         // CRITICAL — must match Razorpay order

      // ── STEP 3: Called automatically when user pays successfully ─────────
      handler: async function (response) {
        try {
          const verifyRes = await fetch(
            `http://localhost:8080/orders/verify-and-place/${userId}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                paymentId:       response.razorpay_payment_id,
                signature:       response.razorpay_signature,
                productQuantities: productQuantities,
                totalAmount: totalAmount,
              }),
            }
          );

          if (!verifyRes.ok) throw new Error("Payment verification failed");

          const order = await verifyRes.json();
          alert("✅ Order placed! Order ID: " + order.id);
          // redirect or clear cart here
        } catch (err) {
          alert("❌ Payment verified but order failed: " + err.message);
        }
      },

      prefill: {
        name:  userName,   // from your logged-in user state
        email: userEmail,
        contact: userPhone || "",
      },

      theme: { color: "#E8671B" },  // matches your orange button

      modal: {
        ondismiss: function () {
          console.log("Payment modal closed by user");
        },
      },
    };

    const rzp = new window.Razorpay(options);

    // ── Handles payment failure inside the modal ──────────────────────────
    rzp.on("payment.failed", async function (response) {
      await fetch(
        `http://localhost:8080/orders/update-payment` +
        `?razorpayOrderId=${response.error.metadata.order_id}` +
        `&paymentId=${response.error.metadata.payment_id}` +
        `&status=FAILED`,
        { method: "POST" }
      );
      alert("❌ Payment failed: " + response.error.description);
    });

    rzp.open(); // ← This opens the modal you're missing

  } catch (err) {
    console.error("Checkout error:", err);
    alert("Something went wrong. Please try again.");
  }

  
};