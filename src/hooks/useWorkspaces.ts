// import { showErrorMessage } from "@/helpers/monday-actions";
// import { executeMondayApiCall, MondayApiResponse } from "@/helpers/monday-api-helpers";
//
// export function mapWorkspacesToDropdownOptions(
//   workspaces: { id: string; name: string; }[] | undefined
// ) {
//   const result = workspaces?.reduce(function reduceToTextColumns(
//     filtered: Record<string, any>[],
//     workspace: Record<string, any>
//   ) {
//     filtered.push({
//       label: workspace.name,
//       value: workspace.id,
//     });
//     return filtered;
//   },
//   []);
//   return result ?? [];
// }

// export default function useWorkspaces(context: AppContextType | undefined) {
//     const [workspaces, setWorkspaces] = useState<any>();
//
//     // fill second dropdown with groups from board
//     useEffect(() => {
//       if (!workspaces && context) {
//         getWorkspaces()
//           .then((res: MondayApiResponse) => {
//             if (!res.is_success) {
//               showErrorMessage('Could not get workspaces.', 3000);
//             } else {
//               const workspaces = res?.data.workspaces
//               workspaces.push({
//                 name: "Main Workspace",
//                 id: 0
//               })
//               // console.log(res?.data)
//               setWorkspaces(workspaces);
//             }
//             // const groupsForDropdown = mapBoardGroupsToDropdownOptions(res);
//             // setBoardGroups(groupsForDropdown);
//           })
//           .catch((err: any) => console.error(err));
//       }
//     }, [context, workspaces]);
//
//     return workspaces;
// }

// export async function getWorkspaces() {
//     let workspaces: any = []
//     await executeMondayApiCall(
//         `query{
//           workspaces{
//               id
//               name
//
//           }
//         }`,
//         {variables: {}}
//     )
//         .then((res: MondayApiResponse) => {
//         if (!res.is_success) {
//             // showErrorMessage('Could not get workspaces.', 3000);
//             console.log(res)
//         } else {
//             const workspaces = res?.data.workspaces
//             workspaces.push({
//                 name: "Main Workspace",
//                 id: 0
//             })
//         }
//     })
//     // .catch((err: any) => console.error(err));
//
//     return workspaces
// }

import { useState, useEffect } from "react";
import { showErrorMessage } from "@/helpers/monday-actions";
import { AppContextType } from "@/types/context-type";
import { executeMondayApiCall, MondayApiResponse } from "@/helpers/monday-api-helpers";


export function mapWorkspacesToDropdownOptions(
    workspaces: { id: string; name: string; }[] | undefined
) {
  const result = workspaces?.reduce(function reduceToTextColumns(
          filtered: Record<string, any>[],
          workspace: Record<string, any>
      ) {
        filtered.push({
          label: workspace.name,
          value: workspace.id,
        });
        return filtered;
      },
      []);
  return result ?? [];
}

export default function useWorkspaces(context: AppContextType | undefined) {
  const [workspaces, setWorkspaces] = useState<any>();

  // fill second dropdown with groups from board
  useEffect(() => {
    if (!workspaces && context) {
      getWorkspaces()
          .then((res: MondayApiResponse) => {
            if (!res.is_success) {
              showErrorMessage('Could not get workspaces.', 3000);
            } else {
              const workspaces = res?.data.workspaces
              workspaces.push({
                name: "Main Workspace",
                id: 0
              })
              // console.log(res?.data)
              setWorkspaces(workspaces);
            }
            // const groupsForDropdown = mapBoardGroupsToDropdownOptions(res);
            // setBoardGroups(groupsForDropdown);
          })
          .catch((err: any) => console.error(err));
    }
  }, [context, workspaces]);

  return workspaces;
}

function getWorkspaces() {
  return executeMondayApiCall(
      `query{
          workspaces{
              id
              name

          }
        }`,
      {variables: {}}
  )
}