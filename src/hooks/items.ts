import { useState, useEffect } from "react";
import { showErrorMessage } from "@/helpers/monday-actions";
import { AppContextType } from "@/types/context-type";
import { executeMondayApiCall, MondayApiResponse } from "@/helpers/monday-api-helpers";




export function getItem(itemId: number) {
    return executeMondayApiCall(
        `query($itemId:[Int!]){
            items (ids:$itemId){
                id
                name
                board {
                  id
                  name
                }
                group {
                  id
                  title
                }
                column_values {
                    text
                    value
                    text
                    description
                    additional_info
                }
            }
        }`,
        {variables: {itemId: [itemId]}}
    ).then((res) => {
        if (res?.is_success) {
            return res;
        } else {
            console.error(res);
            showErrorMessage('Could not load groups', 3000);
        }
    });
}


export function getActivities(boardId: number) {
    return executeMondayApiCall(
        `query($boardId:[Int!]){
            boards (ids:$boardId){
                id
                name
                workspace_id
                groups {
                    id 
                    title
                }
                items {
                    name
                   column_values {
                    text
                    value
                   }
                   updates {
                   body
                   id
                   }
                    subitems {
                        name
                    }
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

