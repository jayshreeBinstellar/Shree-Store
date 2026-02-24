
import React, { useState, useEffect } from 'react';
import * as AdminService from '../../services/AdminService';
import DashboardOverview from '../../components/admin/DashboardOverview';
import Loader from '../../components/Loader';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await AdminService.getStats();
                if (data.status === "success") {
                    setStats(data.stats);
                    setChartData(data.chartData);
                    setCategoryData(data.categoryData);
                    setTopProducts(data.topProducts);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <Loader />;

    return (
        <DashboardOverview
            stats={stats}
            chartData={chartData}
            categoryData={categoryData}
            topProducts={topProducts}
        />
    );
};

export default Dashboard;
