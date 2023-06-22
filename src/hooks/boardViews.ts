import { useState, useEffect } from "react";
import { showErrorMessage } from "@/helpers/monday-actions";
import { AppContextType } from "@/types/context-type";
import { executeMondayApiCall, MondayApiResponse } from "@/helpers/monday-api-helpers";



export function getBoardViews(boardId: number) {
    return executeMondayApiCall(
        `query($boardId:[Int!]){
            boards (ids:$boardId){
                views {
                  type
                  settings_str
                  view_specific_data_str
                  name
                  id
                }
            }
        }`,
        {variables: {boardId: [boardId]}}
    ).then((res) => {
        if (res?.is_success) {
            return res;
        } else {
            console.error(res);
            showErrorMessage('Could not load groups', 3000);
        }
    });
}

