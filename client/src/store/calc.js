import { createSlice } from '@reduxjs/toolkit';

const calcSlice = createSlice({
  name        : 'calc',
  initialState: {
    company_name        : '',
    company_tin         : '',
    users_count         : '1',
    period_service      : '1',
    archive_depth       : [],
    type_storage        : [],
    type_provision      : [],
    cities              : [],
    archive_depth_value : null,
    type_storage_value  : null,
    type_provision_value: null,
    city_value          : null,
    cost_hdd_service    : null,
    cost_ssd_service    : null,
    missed_field        : [],
    enable_save         : false,
  },
  reducers    : {
    loadInfo              : (state, { payload }) => {
      state.archive_depth = payload.archive_depth;
      state.type_storage = payload.type_storage;
      state.type_provision = payload.type_provision;
      state.archive_depth_value = payload.archive_depth[0];
      state.type_storage_value = payload.type_storage[0];
      state.type_provision_value = payload.type_provision[0];
    },
    loadCities            : (state, { payload }) => {
      state.cities = payload;
    },
    setCompanyName        : (state, { payload }) => {
      state.company_name = payload;
    },
    setCompanyTin         : (state, { payload }) => {
      state.company_tin = payload;
    },
    setUserCount          : (state, { payload }) => {
      state.users_count = payload;
    },
    setPeriodService      : (state, { payload }) => {
      state.period_service = payload;
    },
    setMissedFields       : (state, { payload }) => {
      state.missed_field = payload;
    },
    changeValArchiveDepth : (state, { payload }) => {
      state.archive_depth_value = payload;
    },
    changeValTypeStorage  : (state, { payload }) => {
      state.type_storage_value = payload;
    },
    changeValTypeProvision: (state, { payload }) => {
      state.type_provision_value = payload;
    },
    changeValCity         : (state, { payload }) => {
      state.city_value = payload;
    },
    loadCostTotal         : (state, { payload }) => {
      state.cost_hdd_service = payload.cost_hdd_service;
      state.cost_ssd_service = payload.cost_ssd_service;
    },
    clearStoreFields      : (state) => {
      state.company_name = '';
      state.company_tin = '';
      state.users_count = '1';
      state.period_service = '1';
      state.archive_depth_value = null;
      state.type_storage_value = null;
      state.type_provision_value = null;
      state.city_value = null;
    }
  }
});

export const {
  loadInfo,
  loadCities,
  loadCostTotal,
  setUserCount,
  setCompanyTin,
  setCompanyName,
  setPeriodService,
  setMissedFields,
  changeValCity,
  changeValTypeStorage,
  changeValArchiveDepth,
  changeValTypeProvision,
  clearStoreFields
} = calcSlice.actions;
export default calcSlice.reducer;
