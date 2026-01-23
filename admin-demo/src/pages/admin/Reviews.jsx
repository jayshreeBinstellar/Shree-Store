
import React, { useState, useEffect } from 'react';
import * as AdminService from '../../services/AdminService';
import ReviewsManagement from '../../components/admin/ReviewsManagement';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
        try {
            const data = await AdminService.getReviews();
            if (data.status === "success") setReviews(data.reviews);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleUpdateReviewStatus = async (id, status) => {
        try {
            await AdminService.updateReviewStatus(id, status);
            fetchReviews();
        } catch (err) { console.error(err); }
    };

    if (loading) return (
        <div className="h-96 w-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        </div>
    );

    return (
        <ReviewsManagement
            reviews={reviews}
            onUpdateStatus={handleUpdateReviewStatus}
        />
    );
};

export default Reviews;
