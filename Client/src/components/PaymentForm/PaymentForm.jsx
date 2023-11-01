import React from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { getUserById } from "../../redux/actions";
import { useEffect, useState } from "react";
import Success from "../PaymentForm/PaymentSuccessful";
import Loading from "./Loading";
import { FadeLoader } from "react-spinners";
//agregue las comillas de la api key del punto env backend"
import {
	Elements,
	CardElement,
	useStripe,
	useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_test_51O6kJQDPb1shHU4m4biwzWL62bMptJtLFfdhQqzPVr0DFzd8bH0eGxMv0NkcVnWYKJLvhf8e0vcSVQPhfIYdFiQc00xgeGgbjr");

const CheckoutForm = ({ totalAmount, setProcessing }) => {
	const user = useSelector((state) => state.user);
	const dispatch = useDispatch();
	const stripe = useStripe();
	const elements = useElements();
	const [showModal, setShowModal] = useState(false);
	const [showModalLoading, setShowModalLoading] = useState(false)
	const [error, setError] = useState(false);
	const [showErrorModal, setShowErrorModal] = useState(false);
	
	const handleSubmit = async (event) => {
		event.preventDefault();
		setShowModalLoading(true);
		setShowErrorModal(false);


		if (!elements.getElement(CardElement).complete) {
			// Verificar si están todos los datos de la tarjeta
			setShowErrorModal(true);
			
		  }
		  console.log("Datos de la tarjeta:", elements.getElement(CardElement));

		const { error, paymentMethod } = await stripe.createPaymentMethod({
			type: "card",
			card: elements.getElement(CardElement),
		});
		
		console.log("Error de Stripe:", error);
  console.log("Payment Method de Stripe:", paymentMethod);

		if (!error) {
			const { id } = paymentMethod;

			try {
				const { status } = await axios.post("/api/checkout", {
					id,
					amount: totalAmount * 100,
				});
				
				if (status === 200) {
					setShowModal(true);
					dispatch(getUserById(user._id));
					// console.log("SOY EL EMAIL", user.email)
					await axios.post("/mail/payments", {
						email: user.email,
					});
				}
				console.log(status);

				
		} catch (error) {
        console.log(error);
      } finally {
        setShowModalLoading(false);
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

	return (
		<div className="w-full max-h-[300px] max-w-md mx-auto p-10 bg-white rounded-lg shadow-lg text-center">
     {showModalLoading && Loading()}
			{showModal && <Success setShowModal={setShowModal} />}
			{showErrorModal && (<Error setShowErrorModal = {setShowErrorModal}/> )}

			<p className="font-onest pb-6 uppercase text-cyan font-bold text-xl">
				Payment Method
			</p>
			<form onSubmit={handleSubmit}>
				<div className="mb-4 ">
					<CardElement
						className="border rounded-md p-4"
						options={{
							style: {
								base: {
									fontSize: "18px", // Aumentar el tamaño del texto en la tarjeta
									color: "#333", // Cambiar el color del texto
									"::placeholder": {
										color: "#aab7c4",
									},
								},
								invalid: {
									color: "#9e2146",
								},
							},
						}}
					/>
				</div>
				<div className="flex flex-row w-full justify-between">
					<p className="font-onest font-bold text-blue text-2xl">
						U$D {totalAmount}
					</p>
					<button
						className="w-1/2 bg-violet text-white hover:bg-pink text-onest font-semibold py-2 rounded-full"
						type="submit"
					>
						Pay
					</button>
				</div>
			</form>
			{error && (
				<div>
					<p className="text-2xl text-right text-blue font-onest font-extrabold px-3 uppercase">
						There was an error with your reservation!
					</p>
					<p className="text-xl text-right text-cyan font-onest uppercase font-bold px-3">
						Please try again!
					</p>
				</div>
			)}
		</div>
	);
};

const PaymentForm = ({ totalAmount }) => {
	const [processing, setProcessing] = useState(false);

	return (
		<div className="w-full ml-11">
			<div className="text-center absolute text-blue">
				{processing ? (
					<div className="">
						 <FadeLoader loading={processing} color="#54086B" />
				
					</div>
				) : (
					""
				)}
			</div>
			<Elements stripe={stripePromise}>
				<CheckoutForm totalAmount={totalAmount} setProcessing={setProcessing} />
			</Elements>
		</div>
	);
};

export default PaymentForm;
