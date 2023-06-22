import { useState, useEffect } from "react";
import { showErrorMessage } from "@/helpers/monday-actions";
import { AppContextType } from "@/types/context-type";
import { executeMondayApiCall, MondayApiResponse } from "@/helpers/monday-api-helpers";



export function createActivity(boardId: number, itemName: String, columnValues: object) {
    return executeMondayApiCall(
        `mutation($boardId: Int!, $itemName: String!, $columnValues: JSON) {
            create_item (board_id: $boardId, group_id: "topics", item_name: $itemName, column_values: $columnValues) {
                id
            }
        }`,
        {variables: {
                boardId: boardId,
                itemName: itemName,
                columnValues: JSON.stringify(columnValues)
        }}
    )
}

export function updatePeople(boardId: number, itemId: number, email:  string) {

    // const cV = JSON.stringify(columnValues)
    // const query = `mutation($itemId: Int!, $boardId: Int!, $columnValues:JSON) {
    //     change_multiple_column_values(
    //         item_id: ${itemId}
    //         board_id: ${boardId}
    //         column_values: ${cV}
    //     ) {
    //         id
    //     }
    // }`
    // console.log(query)
    return executeMondayApiCall(
        `mutation($itemId: Int!, $boardId: Int!, $email: String!) {
          change_simple_column_value(item_id:$itemId, board_id:$boardId, column_id:"activity_owner", value:$email) {
            id
          }
        }`,
        {variables: {
                boardId: boardId,
                itemId: itemId,
                email: email
            }}
    )
}

export function sendNotification(userId: number, targetId: number, text: string) {
    return executeMondayApiCall(
        `mutation($userId: Int!, $targetId: Int!, $text: String!){
            create_notification (user_id: $userId, target_id: $targetId, text: $text, target_type: Project) {
                text
            }
        }`,
        {variables: {
                userId: userId,
                targetId: targetId,
                text: text
            }}
    )
}

export function updateConnectBoard(boardId: number, itemId: number, customerId: number) {
    return executeMondayApiCall(
        `mutation($itemId: Int!, $boardId: Int!) {
          change_multiple_column_values(item_id:$itemId, board_id:$boardId, column_values: "{\\"activity_item\\" : {\\"item_ids\\" : [${customerId}]}}") {
            id
          }
        }`,
        {variables: {
                boardId: boardId,
                itemId: itemId,
            }}
    )
}

export function getFeatureRequestAccounts(itemId: number) {
    return executeMondayApiCall(
        `query(itemId:[Int!]){
            items (ids:itemId){
                id
                name
                column_values {
                    value
                    text
                    id
                    title
                }
            }
        }`,
        {variables: {
                itemId: itemId,
            }}
    )
}

export function updateFeatureRequestAccount(boardId: number, itemId: number, customerIds: number[]) {
    return executeMondayApiCall(
        `mutation($itemId: Int!, $boardId: Int!) {
          change_multiple_column_values(item_id:$itemId, board_id:$boardId, column_values: "{\\"connect_boards\\" : {\\"item_ids\\" : [${customerIds}]}}") {
            id
          }
        }`,
        {variables: {
                boardId: boardId,
                itemId: itemId,
            }}
    )
}


export function getPulseItemsForActivity(itemId: number) {
    return executeMondayApiCall(
        `query(itemId:[Int!]){
            items (ids:itemId){
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
                items {
                    name
                    column_values {
                        text
                        value
                        text
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

