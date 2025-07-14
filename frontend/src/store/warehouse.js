import { current } from "@reduxjs/toolkit";
import { removeVaultFromStage } from "./stage";

const GET_ALL_WAREHOUSES = "warehouse/GET_ALL_WAREHOUSES";
const SET_CURRENT_WAREHOUSE = "warehouse/SET_CURRENT_WAREHOUSE";
const SET_CURRENT_FIELD = "warehouse/SET_CURRENT_FIELD";
const ADD_VAULT = "warehouse/ADD_VAULT";
const UPDATE_WAREHOUSE_AFTER_STAGING =
  "warehouse/UPDATE_WAREHOUSE_AFTER_STAGING";
const MOVE_VAULT_TO_WAREHOUSE = "warehouse/MOVE_VAULT_TO_WAREHOUSE";
const ADD_ATTACHMENT = "warehouse/ADD_ATTACHMENT";
export const DELETE_VAULT = "warehouse/DELETE_VAULT";
const UPDATE_FIELD_TYPE = "warehouse/UPDATE_FIELD_TYPE";
const ADD_WAREHOUSE = "warehouse/ADD_WAREHOUSE";
const ADD_FIELDS = "warehouse/ADD_FIELDS";
const DELETE_FIELDS = "warehouse/DELETE_FIELDS";
const DELETE_WAREHOUSE = "warehouse/DELETE_WAREHOUSE";
export const SEARCH_WAREHOUSE = "warehouse/SEARCH_WAREHOUSE";
const CLEAR_SEARCH = "warehouse/CLEAR_SEARCH";
const SET_CURRENT_VAULT = "warehouse/SET_CURRENT_VAULT";
const UPDATE_VAULT = "warehouse/UPDATE_VAULT";
const SET_FIELD_FULL = "warehouse/SET_FIELD_FULL";
const EDIT_FIELD_CAPACITY = "warehouse/EDIT_FIELD_CAPACITY";
const UPDATE_FIELD_GRID = "warehouse/UPDATE_FIELD_GRID";

export const updateVault = (payload) => ({
  type: UPDATE_VAULT,
  payload,
});

export const addWarehouse = (warehouse) => ({
  type: ADD_WAREHOUSE,
  warehouse,
});

export const getAllWarehouses = (warehouses) => ({
  type: GET_ALL_WAREHOUSES,
  warehouses,
});

export const setCurrentWarehouse = (warehouse) => ({
  type: SET_CURRENT_WAREHOUSE,
  warehouse,
});

export const setCurrentField = (field) => ({
  type: SET_CURRENT_FIELD,
  field,
});

export const addVault = (payload) => ({
  type: ADD_VAULT,
  payload,
});

export const updateWarehouseAfterStaging = (payload) => ({
  type: UPDATE_WAREHOUSE_AFTER_STAGING,
  payload,
});

export const moveVaultToWarehouse = (payload) => ({
  type: MOVE_VAULT_TO_WAREHOUSE,
  payload,
});

export const addAttachment = (attachment) => ({
  type: ADD_ATTACHMENT,
  attachment,
});

export const deleteVault = (payload) => ({
  type: DELETE_VAULT,
  payload,
});

export const updateFieldType = (fields) => ({
  type: UPDATE_FIELD_TYPE,
  fields,
});

export const addFieldsAction = (
  fields,
  warehouseId,
  newWarehouseRowsCount,
  newWarehouseColsCount
) => ({
  type: ADD_FIELDS,
  fields,
  warehouseId,
  newWarehouseRowsCount,
  newWarehouseColsCount,
});

export const deleteFieldsAction = (
  fields,
  warehouseId,
  newWarehouseRowsCount,
  newWarehouseColsCount
) => ({
  type: DELETE_FIELDS,
  fields,
  warehouseId,
  newWarehouseRowsCount,
  newWarehouseColsCount,
});

export const deleteWarehouse = (warehouseId) => ({
  type: DELETE_WAREHOUSE,
  warehouseId,
});

export const searchWarehouse = (searchTerm, searchType) => ({
  type: SEARCH_WAREHOUSE,
  payload: {
    searchTerm,
    searchType,
  },
});

export const clearSearch = () => ({
  type: CLEAR_SEARCH,
});

export const setCurrentVault = (vault) => ({
  type: SET_CURRENT_VAULT,
  vault,
});

export const setFieldFull = (fieldId, isFull) => ({
  type: SET_FIELD_FULL,
  payload: { fieldId, isFull },
});

export const editFieldCapacity = (warehouse) => ({
  type: EDIT_FIELD_CAPACITY,
  warehouse,
});

export const updateFieldGrid = (warehouseId, fieldgridLocation) => ({
  type: UPDATE_FIELD_GRID,
  payload: { warehouseId, fieldgridLocation },
});

// Action for updating warehouse after dimension edit
export const editWarehouseDimensions = (warehouse) => ({
  type: EDIT_FIELD_CAPACITY,
  warehouse,
});

// Thunk for editing warehouse dimensions
export const editWarehouseDimensionsThunk = (warehouseId, { fieldCapacity, length, width }) => async (dispatch) => {
  try {
    const res = await fetch(`/api/warehouse/${warehouseId}/edit-dimensions`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        field_capacity: fieldCapacity,
        length,
        width,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      dispatch(editWarehouseDimensions(data.warehouse));
      return data;
    } else {
      const err = await res.json();
      console.error("Error editing warehouse dimensions:", err);
      return err;
    }
  } catch (error) {
    console.error("Error editing warehouse dimensions:", error);
    return error;
  }
};

export const getAllWarehousesThunk = (companyId) => async (dispatch) => {
  try {
    const response = await fetch(`/api/warehouse/company/${companyId}`);
    if (response.ok) {
      const data = await response.json();

      dispatch(getAllWarehouses(data));
      return data;
    } else {
      let errorText;
      try {
        errorText = await response.text();
        console.error("Error response text:", errorText);
      } catch (e) {
        errorText = "Could not parse error text";
      }
      console.error("Error fetching warehouses:", errorText);
      return { error: errorText };
    }
  } catch (error) {
    console.error("Error fetching warehouses (catch):", error);
    return error;
  }
};

export const addWarehouseThunk = (warehouseData) => async (dispatch) => {
  try {
    const res = await fetch("/api/warehouse/add-warehouse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(warehouseData),
    });

    if (res.ok) {
      const data = await res.json();
      dispatch(addWarehouse(data));
      return data;
    } else {
      const err = await res.json();
      console.error("Error adding warehouse:", err);
      return err;
    }
  } catch (error) {
    console.error("Error adding warehouse:", error);
    return error;
  }
};

export const updateFieldTypeThunk =
  (fieldId, fieldType, field2, warehouseId) => async (dispatch) => {
    try {
      const response = await fetch(`/api/fields/${fieldId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: fieldType, field2, warehouseId }),
      });

      if (response.ok) {
        const updatedFields = await response.json();
        dispatch(updateFieldType(updatedFields));
        return updatedFields;
      } else {
        const error = await response.json();
        console.error("Error updating field type:", error);
        return error;
      }
    } catch (error) {
      console.error("Error updating field type:", error);
      return error;
    }
  };

export const deleteVaultThunk = (vaultId) => async (dispatch) => {
  try {
    const res = await fetch(`/api/vaults/${vaultId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      const data = await res.json();
      dispatch(deleteVault(data));
      if (data.deleteFrom === "stage") {
        dispatch(removeVaultFromStage(vaultId));
      }
      return data;
    } else {
      const err = await res.json();
      console.error("Error deleting vault:", err);
      return err;
    }
  } catch (error) {
    console.error("Error deleting vault:", error);
    return error;
  }
};

export const uploadAttachmentThunk = (file, vaultId) => async (dispatch) => {
  const formData = new FormData();
  formData.append("attachment", file);
  formData.append("vault_id", vaultId);

  try {
    const res = await fetch("/api/vaults/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      dispatch(addAttachment(data.attachment));
      return data;
    } else {
      const err = await res.json();
      console.error("Error uploading attachment:", err);
      return err;
    }
  } catch (error) {
    console.error("Error uploading attachment:", error);
    return error;
  }
};

export const moveVaultToWarehouseThunk =
  (vaultId, fieldId, position) => async (dispatch) => {
    const input = JSON.stringify({ vaultId, fieldId, position });
    try {
      const res = await fetch(`/api/vaults/move`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: input,
      });
      if (res.ok) {
        const data = await res.json();
        dispatch(moveVaultToWarehouse(data));
        dispatch(removeVaultFromStage(vaultId));
        return data;
      } else {
        const err = await res.json();
        console.error("Error moving vault:", err);
        return err;
      }
    } catch (error) {
      console.error("Error moving vault:", error);
      return error;
    }
  };

export const addVaultThunk = (vaultData) => async (dispatch) => {
  try {
    const res = await fetch("/api/vaults/", {
      method: "POST",
      body: vaultData,
    });
    if (res.ok) {
      const data = await res.json();
      dispatch(addVault(data));
      return data;
    } else {
      const err = await res.json();
      console.error("Error adding vault:", err);
      return err;
    }
  } catch (error) {
    console.error("Error adding vault:", error);
    return error;
  }
};

export const getCurrentFieldThunk = (field) => async (dispatch) => {
  const fieldId = field.id;
  const warehouseId = field.warehouse_id;

  try {
    const res = await fetch(`/api/warehouse/${warehouseId}/${fieldId}`);
    if (res.ok) {
      const data = await res.json();
      dispatch(setCurrentField(data));
      return data;
    } else {
      const err = await res.json();
      console.error("Error fetching field:", err);
      return err;
    }
  } catch (error) {
    console.error("Error fetching field:", error);
    return error;
  }
};

export const addFieldsThunk = (formData) => async (dispatch) => {
  try {
    const res = await fetch(`/api/fields/`, {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      dispatch(
        addFieldsAction(
          data.fields,
          data.warehouseId,
          data.newWarehouseRowsCount,
          data.newWarehouseColsCount
        )
      );
      return data;
    } else {
      const err = await res.json();
      return err;
    }
  } catch (error) {
    console.error("Error adding new fields: ", error);
  }
};

export const deleteFieldsThunk = (formData) => async (dispatch) => {
  try {
    const res = await fetch(`/api/fields/`, {
      method: "DELETE",
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      dispatch(
        deleteFieldsAction(
          data.fields,
          data.warehouseId,
          data.newWarehouseRowsCount,
          data.newWarehouseColsCount
        )
      );
      return data;
    } else {
      const err = await res.json();
      if (err)
        alert(
          "⛔️ Please remove all vaults from the row that you want to delete."
        );
      return err;
    }
  } catch (error) {
    console.error("Error removing fields:", error);
  }
};

export const deleteWarehouseThunk = (warehouseId) => async (dispatch) => {
  try {
    const res = await fetch(`/api/warehouse/${warehouseId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      dispatch(deleteWarehouse(warehouseId));
      return { success: true };
    } else {
      const err = await res.json();
      console.error("Error deleting warehouse:", err);
      return { success: false, error: err };
    }
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    return { success: false, error };
  }
};

export const updateVaultThunk = (vaultData) => async (dispatch) => {
  try {
    const res = await fetch(`/api/vaults/${vaultData.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(vaultData),
    });

    if (res.ok) {
      const data = await res.json();
      dispatch(setCurrentVault(data));
      dispatch(updateVault(data));
      return data;
    } else {
      const err = await res.json();
      console.error("Error updating vault:", err);
      return err;
    }
  } catch (error) {
    console.error("Error updating vault:", error);
    return error;
  }
};

export const setFieldFullThunk = (fieldId, isFull) => async (dispatch) => {
  try {
    const response = await fetch(`/api/fields/${fieldId}/full`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ full: isFull }),
    });

    if (response.ok) {
      const updatedField = await response.json();
      dispatch(setFieldFull(fieldId, isFull));
      return updatedField;
    } else {
      const error = await response.json();
      console.error("Error setting field full:", error);
      return error;
    }
  } catch (error) {
    console.error("Error setting field full:", error);
    return error;
  }
};

export const editFieldCapacityThunk = (warehouseId, fieldCapacity) => async (dispatch) => {
  try {
    const res = await fetch(`/api/warehouse/${warehouseId}/edit-field-capacity`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ field_capacity: fieldCapacity }),
    });

    if (res.ok) {
      const data = await res.json();
      dispatch(editFieldCapacity(data.warehouse));
      return data;
    } else {
      const err = await res.json();
      console.error("Error editing field capacity:", err);
      return err;
    }
  } catch (error) {
    console.error("Error editing field capacity:", error);
    return error;
  }
};

export const updateFieldGridThunk = (warehouseId, fieldgridLocation) => async (dispatch) => {
  try {
    const response = await fetch(`/api/warehouse/${warehouseId}/field-grid`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fieldgridLocation }),
    });

    if (response.ok) {
      const data = await response.json();
      dispatch(updateFieldGrid(warehouseId, data.fieldgridLocation));
      return data;
    } else {
      const error = await response.json();
      console.error("Error updating field grid position:", error);
      return error;
    }
  } catch (error) {
    console.error("Error updating field grid position:", error);
    return error;
  }
};

const initialState = {
  warehouses: {},
  currentWarehouse: null,
  currentField: null,
  currentVault: null,
  search: null,
  currentView: "vault",
};

const warehouseReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_WAREHOUSE:
      const sortedFields = Object.values(action.warehouse.fields).sort(
        (a, b) => a.id - b.id
      );
      const sortedFieldsObj = sortedFields.reduce((acc, field) => {
        acc[field.id] = field;
        return acc;
      }, {});
      return {
        ...state,
        warehouses: {
          ...state.warehouses,
          [action.warehouse.id]: {
            ...action.warehouse,
            fields: sortedFieldsObj,
          },
        },
      };

    case GET_ALL_WAREHOUSES:
      const sortedWarehouses = action.warehouses.sort((a, b) => a.id - b.id);
      const newWarehouses = sortedWarehouses.reduce((acc, warehouse) => {
        const sortedFields = Object.values(warehouse.fields).sort(
          (a, b) => a.id - b.id
        );
        const sortedFieldsObj = sortedFields.reduce((acc, field) => {
          acc[field.id] = field;
          return acc;
        }, {});
        acc[warehouse.id] = {
          ...warehouse,
          fields: sortedFieldsObj,
        };
        return acc;
      }, {});
      return {
        ...state,
        warehouses: newWarehouses,
      };

    case SET_CURRENT_WAREHOUSE:
      if (!action.warehouse?.fields) {
        return {
          ...state,
          currentWarehouse: null,
        };
      }

      const warehouseVaults = Object.values(action.warehouse.fields).flatMap(
        (field) => Object.values(field.vaults)
      );

      const warehousePallets = Object.values(action.warehouse.racks).flatMap((rack) =>
        Object.values(rack.shelves).flatMap((shelf) => Object.values(shelf.pallets))
      );

      const customers = Object.fromEntries(
        [
          ...warehouseVaults.map((vault) => [vault.customer_id, vault.customer_name]),
          ...warehousePallets.map((pallet) => [pallet.customerId, pallet.customerName])
        ]
      );
      
      const orders = Object.fromEntries(
        warehouseVaults.map((vault) => [vault.order_id, vault.order_name])
      );

      return {
        ...state,
        currentWarehouse: {
          ...action.warehouse,
          customers: customers,
          orders: orders,
        },
      };

    case SET_CURRENT_FIELD:
      return {
        ...state,
        currentField: action.field,
      };

    case ADD_VAULT:
      const { fieldId: addFieldId, vault } = action.payload;
      const { id: vaultId } = vault;

      // Find the warehouse containing the field
      const addWarehouseId = Object.keys(state.warehouses).find(
        (id) => state.warehouses[id].fields[addFieldId]
      );

      if (!addWarehouseId) {
        // If no warehouse contains the field, return the current state
        return state;
      }

      // Update the fields with the new vault
      const updatedFields = {
        ...state.warehouses[addWarehouseId].fields,
        [addFieldId]: {
          ...state.warehouses[addWarehouseId].fields[addFieldId],
          vaults: {
            ...state.warehouses[addWarehouseId].fields[addFieldId].vaults,
            [vaultId]: vault,
          },
        },
      };

      // Update the current warehouse if it matches the warehouseId
      const updatedCurrentWarehouse =
        state.currentWarehouse &&
          state.currentWarehouse.id === parseInt(addWarehouseId)
          ? {
            ...state.currentWarehouse,
            fields: updatedFields,
          }
          : state.currentWarehouse;

      // Update the current field if it matches the fieldId
      const updatedCurrentField =
        state.currentField && state.currentField.id === parseInt(addFieldId)
          ? {
            ...state.currentField,
            vaults: {
              ...state.currentField.vaults,
              [vaultId]: vault,
            },
          }
          : state.currentField;

      return {
        ...state,
        warehouses: {
          ...state.warehouses,
          [addWarehouseId]: {
            ...state.warehouses[addWarehouseId],
            fields: updatedFields,
          },
        },
        currentWarehouse: updatedCurrentWarehouse,
        currentField: updatedCurrentField,
      };

    case ADD_ATTACHMENT:
      const { vault_id, ...attachment } = action.attachment;
      const updatedVault = {
        ...state.currentField.vaults[vault_id],
        attachments: [
          ...state.currentField.vaults[vault_id].attachments,
          attachment,
        ],
      };

      return {
        ...state,
        currentField: {
          ...state.currentField,
          vaults: {
            ...state.currentField.vaults,
            [vault_id]: updatedVault,
          },
        },
      };

    case UPDATE_WAREHOUSE_AFTER_STAGING:
      const stagedVaultId = action.payload.id;
      const stagedFieldId = action.payload.old_field_id;

      // Find the warehouse containing the field
      const stagedWarehouseId = Object.keys(state.warehouses).find(
        (id) => state.warehouses[id].fields[stagedFieldId]
      );
      if (!stagedWarehouseId) {
        // If no warehouse contains the field, return the current state
        return state;
      }

      const vaultsArr = Object.values(
        state.warehouses[stagedWarehouseId].fields[stagedFieldId].vaults
      );

      const updatedVaults = vaultsArr.filter(
        (vault) => vault.id !== stagedVaultId
      );

      const updatedVaultsObj = updatedVaults.reduce((acc, vault) => {
        acc[vault.id] = vault;
        return acc;
      }, {});

      // Remove the vault from the fields
      const updatedFieldsAfterStaging = {
        ...state.warehouses[stagedWarehouseId].fields,
        [stagedFieldId]: {
          ...state.warehouses[stagedWarehouseId].fields[stagedFieldId],
          vaults: updatedVaultsObj,
        },
      };

      // Update the current warehouse if it matches the warehouseId
      const updatedCurrentWarehouseAfterStaging =
        state.currentWarehouse &&
          state.currentWarehouse.id === parseInt(stagedWarehouseId)
          ? {
            ...state.currentWarehouse,
            fields: {
              ...state.currentWarehouse.fields,
              [stagedFieldId]: {
                ...state.currentWarehouse.fields[stagedFieldId],
                vaults: updatedVaultsObj,
              },
            },
          }
          : state.currentWarehouse;

      // Remove the vault from the current field
      const updatedCurrenField =
        state.currentField && state.currentField.id === parseInt(stagedFieldId)
          ? {
            ...state.currentField,
            vaults: updatedVaultsObj,
          }
          : state.currentField;

      return {
        ...state,
        warehouses: {
          ...state.warehouses,
          [stagedWarehouseId]: {
            ...state.warehouses[stagedWarehouseId],
            fields: updatedFieldsAfterStaging,
          },
        },
        currentWarehouse: updatedCurrentWarehouseAfterStaging,
        currentField: updatedCurrenField,
      };

    case MOVE_VAULT_TO_WAREHOUSE:
      const {
        vaultId: moveVaultId,
        fieldId: moveFieldId,
        position: movePosition,
        vault: moveVault,
      } = action.payload;

      // Find the warehouse containing the field
      const targetWarehouseId = Object.keys(state.warehouses).find(
        (id) => state.warehouses[id].fields[moveFieldId]
      );

      if (!targetWarehouseId) {
        // If no warehouse contains the field, return the current state
        return state;
      }

      // Update the fields with the moved vault
      const updatedTargetFields = {
        ...state.warehouses[targetWarehouseId].fields,
        [moveFieldId]: {
          ...state.warehouses[targetWarehouseId].fields[moveFieldId],
          vaults: {
            ...state.warehouses[targetWarehouseId].fields[moveFieldId].vaults,
            [moveVaultId]: moveVault,
          },
        },
      };

      return {
        ...state,
        warehouses: {
          ...state.warehouses,
          [targetWarehouseId]: {
            ...state.warehouses[targetWarehouseId],
            fields: updatedTargetFields,
          },
        },
        currentField: null,
        currentWarehouse: {
          ...state.currentWarehouse,
          fields: updatedTargetFields,
        },
      };

    case DELETE_VAULT:
      const deleteFrom = action.payload.deleteFrom;

      if (deleteFrom === "stage") return state;

      return {
        ...state,
        currentField: action.payload.field,
        currentWarehouse: action.payload.warehouse,
        warehouses: {
          ...state.warehouses,
          [action.payload.warehouse.id]: action.payload.warehouse,
        }
      };

    case UPDATE_FIELD_TYPE:
      const { field1, field2 } = action.fields;
      const warehouseId = field1.warehouse_id;

      return {
        ...state,
        warehouses: {
          ...state.warehouses,
          [warehouseId]: {
            ...state.warehouses[warehouseId],
            fields: {
              ...state.warehouses[warehouseId].fields,
              [field1.id]: field1,
              [field2.id]: field2,
            },
          },
        },
        currentWarehouse: {
          ...state.currentWarehouse,
          fields: {
            ...state.currentWarehouse.fields,
            [field1.id]: field1,
            [field2.id]: field2,
          },
        },
        currentField: {
          ...state.currentField,
          type: field1.type,
        },
      };

    case ADD_FIELDS:
      return {
        ...state,
        warehouses: {
          ...state.warehouses,
          [action.warehouseId]: {
            ...state.warehouses[action.warehouseId],
            fields: {
              ...state.warehouses[action.warehouseId].fields,
              ...action.fields.reduce((acc, field) => {
                acc[field.id] = field;
                return acc;
              }, {}),
            },
            rows: action.newWarehouseRowsCount,
            cols: action.newWarehouseColsCount,
          },
        },
        currentWarehouse: {
          ...state.currentWarehouse,
          fields: {
            ...state.currentWarehouse.fields,
            ...action.fields.reduce((acc, field) => {
              acc[field.id] = field;
              return acc;
            }, {}),
          },
          rows: action.newWarehouseRowsCount,
          cols: action.newWarehouseColsCount,
        },
      };

    case DELETE_FIELDS:
      const updatedFieldsAfterDeletion = action.fields;

      return {
        ...state,
        warehouses: {
          ...state.warehouses,
          [action.warehouseId]: {
            ...state.warehouses[action.warehouseId],
            fields: updatedFieldsAfterDeletion,
            rows: action.newWarehouseRowsCount,
            cols: action.newWarehouseColsCount,
          },
        },
        currentWarehouse: {
          ...state.currentWarehouse,
          fields: updatedFieldsAfterDeletion,
          rows: action.newWarehouseRowsCount,
          cols: action.newWarehouseColsCount,
        },
      };

    case DELETE_WAREHOUSE:
      const { [action.warehouseId]: _, ...remainingWarehouses } =
        state.warehouses;
      return {
        ...state,
        warehouses: remainingWarehouses,
        currentWarehouse: null,
      };

    case SEARCH_WAREHOUSE:
      const type = action.payload.searchType;
      const searchTerm = action.payload.searchTerm;

      const currentView = state.currentView;

      if (currentView == "vault") {
        const fields = Object.values(state.currentWarehouse.fields);
        const vaults = fields.flatMap((field) => Object.values(field.vaults));

        const vaultsContainingSearchTerm =
          type == "order"
            ? vaults.filter((vault) => vault.order_name === searchTerm)
            : type == "customer"
              ? vaults.filter((vault) => vault.customer_name === searchTerm)
              : [];

        const fieldIds = vaultsContainingSearchTerm.map(
          (vault) => vault.field_id
        );

        return {
          ...state,
          search: fieldIds,
        };
      }

      if (currentView == "rack") {
        // 🍐 RACK VIEW SEARCH!
        // Find racks and pallets matching the customer name
        const racks = Object.values(state.currentWarehouse.racks || {});
        let matchingRackIds = [];
        let matchingPalletIds = [];
        racks.forEach((rack) => {
          rack.shelves &&
            Object.values(rack.shelves).forEach((shelf) => {
              Object.values(shelf.pallets || {}).forEach((pallet) => {
                if (
                  type === "customer" &&
                  pallet.customerName &&
                  pallet.customerName.toUpperCase() === searchTerm.toUpperCase()
                ) {
                  matchingRackIds.push(rack.id);
                  matchingPalletIds.push(pallet.id);
                }
              });
            });
        });
        return {
          ...state,
          search: {
            customerName: searchTerm,
            rackIds: matchingRackIds,
            palletIds: matchingPalletIds,
          },
        };
      }

    case CLEAR_SEARCH:
      return {
        ...state,
        search: null,
      };

    case SET_CURRENT_VAULT:
      if (!state.currentWarehouse) {
        return state;
      }
      return {
        ...state,
        currentVault: {
          ...action.vault,
          warehouse_name: state.currentWarehouse.name.split(" ").join("-").toLowerCase(),
        },
      };

    case UPDATE_VAULT:
      const editedVault = action.payload;
      // Find the warehouse and field containing the vault
      let updatedWarehouses = { ...state.warehouses };
      let warehouseIdToUpdate = null;
      let fieldIdToUpdate = null;

      // Find the warehouse and field containing the vault
      for (const [wid, warehouse] of Object.entries(state.warehouses)) {
        for (const [fid, field] of Object.entries(warehouse.fields)) {
          if (field.vaults && field.vaults[editedVault.id]) {
            warehouseIdToUpdate = wid;
            fieldIdToUpdate = fid;
            break;
          }
        }
        if (warehouseIdToUpdate) break;
      }

      if (warehouseIdToUpdate && fieldIdToUpdate) {
        // Replace the vault object everywhere, not merging with old data
        updatedWarehouses = {
          ...state.warehouses,
          [warehouseIdToUpdate]: {
            ...state.warehouses[warehouseIdToUpdate],
            fields: {
              ...state.warehouses[warehouseIdToUpdate].fields,
              [fieldIdToUpdate]: {
                ...state.warehouses[warehouseIdToUpdate].fields[fieldIdToUpdate],
                vaults: {
                  ...state.warehouses[warehouseIdToUpdate].fields[fieldIdToUpdate].vaults,
                  [editedVault.id]: { ...editedVault }, // full replace
                }
              }
            }
          }
        };
      }

      // Replace vault in currentField and currentVault as well
      return {
        ...state,
        warehouses: updatedWarehouses,
        currentVault: { ...editedVault },
        currentField: state.currentField && state.currentField.vaults && state.currentField.vaults[editedVault.id]
          ? {
              ...state.currentField,
              vaults: {
                ...state.currentField.vaults,
                [editedVault.id]: { ...editedVault },
              }
            }
          : state.currentField,
      };

    case SET_FIELD_FULL:
      const { fieldId, isFull } = action.payload;
      const updatedField = {
        ...state.warehouses[state.currentWarehouse.id].fields[fieldId],
        full: isFull,
      };

      return {
        ...state,
        warehouses: {
          ...state.warehouses,
          [state.currentWarehouse.id]: {
            ...state.warehouses[state.currentWarehouse.id],
            fields: {
              ...state.warehouses[state.currentWarehouse.id].fields,
              [fieldId]: updatedField,
            },
          },
        },
        currentField: {
          ...state.currentField,
          full: isFull,
        },
      };

    case EDIT_FIELD_CAPACITY:
      return {
        ...state,
        warehouses: {
          ...state.warehouses,
          [action.warehouse.id]: action.warehouse,
        },
        currentWarehouse:
          state.currentWarehouse?.id === action.warehouse.id
            ? action.warehouse
            : state.currentWarehouse,
      };

    case UPDATE_FIELD_GRID:
      return {
        ...state,
        warehouses: {
          ...state.warehouses,
          [action.payload.warehouseId]: {
            ...state.warehouses[action.payload.warehouseId],
            fieldgridLocation: action.payload.fieldgridLocation,
          },
        },
      };
    case "warehouse/setCurrentView":
      return { ...state, currentView: action.payload };
    default:
      return state;
  }
};

export default warehouseReducer;

// Add this export if not already present
export const setCurrentView = (view) => ({
  type: "warehouse/setCurrentView",
  payload: view,
});
