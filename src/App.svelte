<script type="ts">
    import type { InitialInfo } from "@kosy/kosy-app-api/types";
    import type { AppState } from "./lib/appState";
    import { KosyApi } from "@kosy/kosy-app-api";
    import Button from "@kosy/kosy-svelte-components/Button.svelte";
    import type { AppMessage } from "./lib/appMessages";
    import { v4 as uuidv4 } from "uuid";
   
    let state: AppState = { appUrl: null };
    let informationIsOpen = false;

    let getState = () => {
        return state;
    }

    let setState = (newState: AppState) => {
        if (newState?.appUrl) {
            state = newState;
        }
    }

    const kosyApi = new KosyApi<AppState, AppMessage, AppMessage>({
        //No need to deny or change the message in any way -> forward to all clients
        onReceiveMessageAsHost: (message) => message,
        onReceiveMessageAsClient: (message) => {
            switch (message.type) {
                case "receive-codenames-url":
                    state = { appUrl: message.payload };
                    break;
                default:
                    break;
            }
        },
        onRequestState: () => getState(),
        onProvideState: (newState: AppState) => setState(newState)
    });

    let loadPromise = kosyApi.startApp().then((initialInfo: InitialInfo<AppState>) => {
        if (initialInfo.currentClientUuid == initialInfo.initializerClientUuid) {
            kosyApi.relayMessage({ 
                type: "receive-codenames-url", 
                payload: `https://www.horsepaste.com/${initialInfo.locationUuid}_${uuidv4()}` 
            });
        }
        setState(initialInfo.currentAppState);
    });

    const toggleInformation = () => informationIsOpen = !informationIsOpen;
</script>

<style lang="scss">
    main {
        max-width: 400px;
    }

    iframe {
        width: 100vw;
        height: 99vh;
        border: 0;
    }

    h3:first-child {
        margin-top: 0px;
    }

    .pop-up {
        position: absolute;
        left: 12px;
        bottom: 78px;
        max-height: 300px;
        overflow-y: auto;
        max-width: 50%;
        background-color: white;
        border-radius: 16px;
        border: 1.5px solid #F6F7F9;
        box-shadow: 0 8px 24px 0 #cccccc40;

        div {
            padding: 24px;
        }
    }

    ol {
        padding-left: 16px;
        margin-bottom: 0;

        li {
            line-height: 20px;
        }

        li:not(:first-child) {
            margin-top: 8px;
        }
    }

    ol ol {
        padding-left: 28px;
        list-style: lower-alpha;

        li:first-child {
            margin-top: 8px;
        }
    }
</style>

<main>
    {#await loadPromise then _data }
        <iframe title="codenames iframe" src={state.appUrl} />
        {#if informationIsOpen}
            <div class="pop-up">
                <div>
                    <h3>What is the goal?</h3>
                    <ol>
                        <li>Players split into 2 teams: Blue & Red, with each team assigning a Spymaster. The rest of the team are Field Operatives.</li>
                        <li>The Spymasters go in Spymaster mode in the bottom right corner. Spymasters of each team can check agents’ team color, hiding behind the codenames.</li>
                        <li>Spymasters must guide each team to guess the codenames of their team’s agents by providing a clue to them.</li>
                        <li>Teams use the clue to guess the right codenames related to their team’s agents</li>
                        <li>Winning team is the team that uncovers the identities of all their agents</li>
                    </ol>
                    <h3>Gameplay</h3>
                    <span>Teams take turns to do the following:</span>
                    <ol>
                        <li>The team’s Spymaster gives clues:
                            <ol>
                                <li>Spymaster selects the codenames he/she would like the field operatives to uncover</li>
                                <li>Spymaster gives a one-word clue and shouts out the number of codenames it relates to. This number will indicate the number of correct guesses the team can make for the turn. If the team makes a correct guess form previous clue, they are allowed 1 extra guess</li>
                            </ol>
                        </li>
                        <li>Team’s field operatives guess the codenames to uncover:
                            <ol>
                                <li>Teammates discuss the clue and make a guess by touching one of the codenames on the table</li>
                                <li>If it uncovers an agent belonging to the team, they continue guessing until they uncover all codenames related to the clue</li>
                                <li>The turn is passed to the next team, if any of the guesses are wrong</li>
                            </ol>
                        </li>
                        <li>Both teams lose if they uncover an Assassin card.</li>
                    </ol>
                </div>
            </div>
        {/if}
        <Button importance="secondary" on:click={() => toggleInformation()}>
            <img class="icon-left" src="assets/Question-icon.png" alt="question-mark" />
            How to play
        </Button>
    {/await}
</main>