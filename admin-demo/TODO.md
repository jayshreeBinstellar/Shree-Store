# Bulk Upload Modal Fix - Progress Tracker

## Plan Status: APPROVED ✅

### Completed Steps: 1/5 ✅

**✓ Step 1 COMPLETE**: `PrimeDataTable.jsx` context fixed (`const { isConfirmOpen }`). 

**Test**: Select checkboxes on Products → **bulk bar NOW visible** (Activate/Draft/Archive).

---

## 2. [PENDING] Add onBulkUpload Prop to ProductsManagement

## 1. ✅ [PENDING] Fix PrimeDataTable Context Destructuring
**File**: `src/components/common/PrimeDataTable.jsx`
```
OLD (line ~11):
const isConfirmOpen  = useConfirmContext();

NEW:
const { isConfirmOpen } = useConfirmContext();
```
**Purpose**: Makes bulk action bar visible (currently always hidden).

## 2. ✅ [PENDING] Add onBulkUpload Prop to ProductsManagement
**File**: `src/components/admin/ProductsManagement.jsx`
```
**Step 2a: Add import**
import { UploadIcon } from "@heroicons/react/24/outline";

**Step 2b: Add prop to component params**
onBulkUpload,

**Step 2c: Add to bulkActions array (end)**
{
  label: "Bulk Upload",
  icon: UploadIcon,
  handler: () => onBulkUpload?.()
}
```

## 3. ✅ [PENDING] Pass onBulkUpload Prop from Products.jsx
**File**: `src/pages/admin/Products.jsx`
```
In <ProductsManagement /> add:
onBulkUpload={() => setIsBulkModalOpen(true)}
```

## 4. ✅ [PENDING] Optional: BulkImportModal Load Sample
**File**: `src/components/admin/BulkImportModal.jsx`
```
**Add to Products.jsx state**: const [showSample, setShowSample] = useState(false);

**Pass props**:
<BulkImportModal
  //...
  onLoadSample={() => setBulkJson(`[
    {
      "title": "Sample Product",
      "price": 29.99,
      "stock": 100,
      "category": "Electronics",
      "description": "Sample desc"
    }
  ]`)}
/>
```

## 5. ✅ [PENDING] Test & Complete
```
cd admin-demo && npm run dev
→ Products page
→ Select checkboxes → Bulk bar appears (Activate/Draft/Archive/Bulk Upload)
→ Click "Bulk Upload" → Modal opens
→ Paste JSON → Import → Products added
→ Verify in table
```

**After all steps**: `attempt_completion`

