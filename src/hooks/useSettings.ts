import { useState, useEffect } from "react";
import { showErrorMessage } from "@/helpers/monday-actions";
import { AppContextType } from "@/types/context-type";
import { executeMondayApiCall, MondayApiResponse } from "@/helpers/monday-api-helpers";

import mondaySdk from 'monday-sdk-js';
const monday = mondaySdk();

function getSettings() {
  return monday.storage.instance.getItem('settings').then(res => {
 });
}

function setSettings(settings: any) {
  return monday.storage.instance.setItem('settings', settings).then(res => {
  });
}


export { getSettings, setSettings };
