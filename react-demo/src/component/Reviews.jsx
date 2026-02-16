import React, { useState, useEffect } from "react";
import { Rating, Button, CircularProgress } from "@mui/material";
import { getReviews, addReview } from "../services/ShopService";
import { toast } from "react-hot-toast";

const Reviews = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchReviews = async () => {
        try {
            const data = await getReviews(productId);
            if (data.status === "success") {
                setReviews(data.reviews);
            }
        } catch (err) {
            console.error("Failed to fetch reviews", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Please login to leave a review");
            return;
        }

        setIsSubmitting(true);
        try {
            const data = await addReview(productId, { rating, comment });
            if (data.status === "success") {
                setComment("");
                setRating(5);
                toast.success("Review submitted!");
                fetchReviews(); // Refresh reviews
            } else {
                toast.error(data.message || "Failed to submit review");
            }
        } catch (err) {
            console.error("Error submitting review", err);
            toast.error("Error submitting review");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <CircularProgress size="1.5rem" />;

    return (
        <div className="space-y-6">
            {/* Review Form */}
            <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Leave a Review</h4>
                <div>
                    <Rating
                        value={rating}
                        onChange={(event, newValue) => setRating(newValue)}
                        size="medium"
                    />
                </div>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts about this product..."
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none min-h-25"
                    required
                />
                <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    className="bg-indigo-600! hover:bg-indigo-700! rounded-lg! py-2! px-6! text-xs! font-bold! normal-case!"
                >
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
            </form>

            {/* Review List */}
            <div className="space-y-4">
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review.review_id} className="border-b border-gray-100 pb-4 last:border-0">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-black text-gray-900">{review.full_name}</span>
                                <span className="text-[10px] text-gray-400 font-medium">
                                    {new Date(review.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <Rating value={Number(review.rating)} readOnly size="small" className="mb-2" />
                            <p className="text-xs text-gray-600 leading-relaxed italic">
                                "{review.comment}"
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="text-xs text-gray-400 font-medium italic">No reviews yet. Be the first to review!</p>
                )}
            </div>
        </div>
    );
};

export default React.memo(Reviews);
