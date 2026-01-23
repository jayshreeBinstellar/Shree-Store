import React from "react";
import { Pagination, Stack, Typography } from "@mui/material";

const MuiPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  itemsTotal = 0,
  itemsPerPage = 10,
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, itemsTotal);

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ p: 2, borderTop: "1px solid #eee" }}
    >
      {/* Info text */}
      <Typography variant="body2" color="text.secondary">
        {itemsTotal > 0 &&
          `Showing ${startItem} to ${endItem} of ${itemsTotal} items`}
      </Typography>

      {/* Pagination */}
      <Stack direction="row" spacing={2} alignItems="center">
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={(_, page) => onPageChange(page)}
          color="primary"
          shape="rounded"
          disabled={isLoading}
          showFirstButton
          showLastButton
        />

        <Typography variant="caption" color="text.secondary">
          Page {currentPage} of {totalPages}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default MuiPagination;
