
import React, { useState, useEffect } from 'react';
import * as AdminService from '../../services/AdminService';
import ReviewsManagement from '../../components/admin/ReviewsManagement';
import { toast } from 'react-hot-toast';
import Loader from '../../components/Loader';

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
            toast.success(`Review ${status.toLowerCase()}`);
            fetchReviews();
        } catch (err) {
            console.error(err);
            toast.error("Failed to update status");
        }
    };

    if (loading) return <Loader />;

    return (
        <ReviewsManagement
            reviews={reviews}
            onUpdateStatus={handleUpdateReviewStatus}
        />
    );
};

export default Reviews;
