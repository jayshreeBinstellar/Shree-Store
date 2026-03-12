import React, { useState } from "react";
import * as AdminService from "../../services/AdminService";
import SupportDesk from "../../components/admin/SupportDesk";
import TicketModal from "../../components/admin/TicketModal";
import { toast } from "react-hot-toast";
import Loader from "../../components/common/Loader.jsx";
import useDataTable from "../../utils/useDataTable.jsx";

const defaultFilters = {
  global: { value: "", matchMode: "contains" },
  full_name: { value: "", matchMode: "contains" },
  subject: { value: "", matchMode: "contains" }
};

const Support = () => {

  const {
    data: tickets,
    loading,
    totalRecords,
    searchValue,
    lazyParams,
    selectedItems,
    setSelectedItems,
    handleSearch,
    handleLazyLoad,
    handleSelectAll,
    resetFilters,
    fetchData
  } = useDataTable({
    defaultFilters,
    fetchFn: AdminService.getTickets
  });

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState("All");


  const handleFilterChange = (status) => {
    setCurrentFilter(status);

    handleLazyLoad({
      ...lazyParams,
      first: 0,
      filters: {
        ...lazyParams.filters,
        status: {
          value: status === "All" ? "" : status,
          matchMode: "equals"
        }
      }
    });
  };


  const handleBulkStatusUpdate = async (selectedRows, status) => {
    try {
      const ids = selectedRows.map((t) => t.ticket_id);

      await AdminService.bulkUpdateTicketStatus(ids, status);

      toast.success(`${selectedRows.length} tickets ${status.toLowerCase()}`);
      setSelectedItems([]);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Bulk update failed");
    }
  };


  const handleTicketReply = async () => {
    if (!replyText.trim()) return;

    try {
      setModalLoading(true);

      await AdminService.updateTicketStatus(
        selectedTicket.ticket_id,
        "Resolved",
        replyText
      );

      toast.success("Reply sent and ticket resolved");

      setReplyText("");
      setIsTicketModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to send reply");
    } finally {
      setModalLoading(false);
    }
  };


  const handleStatusChange = async (newStatus) => {
    try {
      setModalLoading(true);

      await AdminService.updateTicketStatus(
        selectedTicket.ticket_id,
        newStatus,
        ""
      );

      toast.success(`Ticket marked as ${newStatus}`);

      setSelectedTicket((prev) => ({
        ...prev,
        status: newStatus
      }));

      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    } finally {
      setModalLoading(false);
    }
  };

  /* ================= VIEW ================= */

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setReplyText("");
    setIsTicketModalOpen(true);
  };

  if (loading && !tickets.length) {
    return <Loader message="Loading support tickets..." />;
  }

  return (
    <>
      <SupportDesk
        tickets={tickets}
        loading={loading}
        onViewTicket={handleViewTicket}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        searchValue={searchValue}
        totalRecords={totalRecords}
        onLazy={handleLazyLoad}
        lazyParams={lazyParams}
        onSelectAll={handleSelectAll}
        onBulkStatusUpdate={handleBulkStatusUpdate}
        selection={selectedItems}
        onSelectionChange={setSelectedItems}
        onReload={resetFilters}
      />

      <TicketModal
        open={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        ticket={selectedTicket}
        replyText={replyText}
        setReplyText={setReplyText}
        onReply={handleTicketReply}
        onStatusChange={handleStatusChange}
        loading={modalLoading}
      />
    </>
  );
};

export default Support;