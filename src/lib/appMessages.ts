/// Messages that are relayed to all of the clients
export type AppMessage =
    | ReceiveCodenamesUrl

export interface ReceiveCodenamesUrl {
    type: "receive-codenames-url";
    payload: string;
}