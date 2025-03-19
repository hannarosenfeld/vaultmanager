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
const SEARCH_WAREHOUSE = "warehouse/SEARCH_WAREHOUSE";
const CLEAR_SEARCH = "warehouse/CLEAR_SEARCH";
const SET_CURRENT_VAULT = "warehouse/SET_CURRENT_VAULT";

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

export const getAllWarehousesThunk = () => async (dispatch) => {
  try {
    const response = await fetch("/api/warehouse/");
    if (response.ok) {
      const data = await response.json();
      dispatch(getAllWarehouses(data));
      return data;
    } else {
      const errorData = await response.json();
      console.error("Error fetching warehouses:", errorData.errors);
      return errorData;
    }
  } catch (error) {
    console.error("Error fetching warehouses:", error);
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
      dispatch(deleteVault({ vaultId, deleteFrom: data.deleteFrom }));
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
      console.log("Error adding new fields: ", err);
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
      console.log("Error removing fields:", err.error);
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
  console.log("💖 ", vaultData)
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

const initialState = {
  warehouses: {},
  currentWarehouse: null,
  currentField: null,
  currentVault: null,
  search: null,
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
      const customers = Object.fromEntries(
        warehouseVaults.map((vault) => [vault.customer_id, vault.customer_name])
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
        currentWarehouse: null,
        currentField: null,
      };

    case DELETE_VAULT:
      const deletedVaultId = action.payload.vaultId;
      const deleteFrom = action.payload.deleteFrom;

      if (deleteFrom === "stage") return state;

      // Remove the vault from the current field
      const updatedCurrentFieldAfterVaultDeletion = {
        ...state.currentField,
        vaults: Object.keys(state.currentField.vaults)
          .filter((id) => id !== deletedVaultId.toString())
          .reduce((acc, id) => {
            acc[id] = state.currentField.vaults[id];
            return acc;
          }, {}),
      };

      // Remove the vault from the current warehouse
      const updatedCurrentWarehouseAfterVaultDeletion = {
        ...state.currentWarehouse,
        fields: {
          ...state.currentWarehouse.fields,
          [state.currentField.id]: updatedCurrentFieldAfterVaultDeletion,
        },
      };

      // Remove the vault from the warehouses
      const updatedWarehouses = {
        ...state.warehouses,
        [state.currentWarehouse.id]: {
          ...state.warehouses[state.currentWarehouse.id],
          fields: {
            ...state.warehouses[state.currentWarehouse.id].fields,
            [state.currentField.id]: updatedCurrentFieldAfterVaultDeletion,
          },
        },
      };

      return {
        ...state,
        currentField: updatedCurrentFieldAfterVaultDeletion,
        currentWarehouse: updatedCurrentWarehouseAfterVaultDeletion,
        warehouses: updatedWarehouses,
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

    case CLEAR_SEARCH:
      return {
        ...state,
        search: null,
      };

    case SET_CURRENT_VAULT:
      return {
        ...state,
        currentVault: action.vault,
      };

    default:
      return state;
  }
};

export default warehouseReducer;
