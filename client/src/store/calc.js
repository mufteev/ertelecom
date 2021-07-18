import { createSlice } from '@reduxjs/toolkit';

const calcSlice = createSlice({
  name        : 'calc',
  initialState: {
    company_name    : '',
    company_tin     : '',
    users_count     : '1',
    period_service  : '1',
    archive_depths  : [],
    type_storages   : [],
    type_provisions : [],
    cities          : [],
    archive_depth   : null,
    type_storage    : null,
    type_provision  : null,
    city            : null,
    cost_hdd_service: null,
    cost_ssd_service: null,
    missed_field    : [],
    enable_save     : false,
  },
  reducers    : {
    loadInfo              : (state, { payload }) => {
      state.archive_depths = payload.archive_depth;
      state.type_storages = payload.type_storage;
      state.type_provisions = payload.type_provision;
      state.archive_depth = payload.archive_depth[0];
      state.type_storage = payload.type_storage[0];
      state.type_provision = payload.type_provision[0];
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
      state.archive_depth = payload;
    },
    changeValTypeStorage  : (state, { payload }) => {
      state.type_storage = payload;
    },
    changeValTypeProvision: (state, { payload }) => {
      state.type_provision = payload;
    },
    changeValCity         : (state, { payload }) => {
      state.city = payload;
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
      state.archive_depth = state.archive_depths[0];
      state.type_storage = state.type_storages[0];
      state.type_provision = state.type_provisions[0];
      state.city = null;
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
