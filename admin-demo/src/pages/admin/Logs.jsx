import React from "react";
import * as AdminService from "../../services/AdminService";
import ActivityLogs from "../../components/admin/ActivityLogs";
import Loader from "../../components/common/Loader";
import useDataTable from "../../utils/useDataTable";

const defaultFilters = {
  global: { value: "", matchMode: "contains" },
  admin_name: { value: "", matchMode: "contains" },
  action: { value: "", matchMode: "contains" }
};

const Logs = () => {

  const {
    data: logs,
    loading,
    totalRecords,
    searchValue,
    lazyParams,
    handleSearch,
    handleLazyLoad,
    resetFilters
  } = useDataTable({
    defaultFilters,
    fetchFn: AdminService.getLogs
  });

  if (loading && !logs.length) {
    return <Loader message="Loading audit logs..." />;
  }

  return (
    <ActivityLogs
      logs={logs}
      search={searchValue}
      onSearch={handleSearch}
      totalRecords={totalRecords}
      onLazy={handleLazyLoad}
      lazyParams={lazyParams}
      isLoading={loading}
      filters={lazyParams.filters}
      onReload={resetFilters}

    />
  );
};

export default Logs;