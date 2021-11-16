<script type="ts">
    import type { InitialInfo } from "@kosy/kosy-app-api/types";
    import type { AppState } from "./lib/appState";
    import { KosyApi } from "@kosy/kosy-app-api";
    import Button from "@kosy/kosy-svelte-components/Button.svelte";
   
    let state: AppState = {};
    let tableUrl: string;
    let informationIsOpen = false;

    let getState = () => {
        return state;
    }

    let setState = (newState: AppState) => {
        if (newState) { state = newState }
    }

    const kosyApi = new KosyApi<AppState, { type: "" }, { type: "" }>({
        //No need to deny or change the message in any way -> forward to all clients
        onReceiveMessageAsHost: (message) => message,
        onReceiveMessageAsClient: (message) => {},
        onRequestState: () => getState(),
        onProvideState: (newState: AppState) => setState(newState)
    });

    let loadPromise = kosyApi.startApp().then((initialInfo: InitialInfo<AppState>) => {
        const clientLocation = initialInfo.clients[initialInfo.currentClientUuid].clientLocation
        tableUrl = `https://www.horsepaste.com/kosy_${clientLocation.building.buildingName}_${clientLocation.floor.floorName}_${clientLocation.room.roomName}_${clientLocation.table.tableName}`
    });

    const toggleInformation = () => informationIsOpen = !informationIsOpen;
</script>

<style lang="scss">
    main {
        max-width: 400px;
    }

    iframe {
        width: 100%;
        height: 88vh;
        border: 0;
    }

    .bottom-bar {
        width: 100%;
    }

    .pop-up {
        max-height: 300px;
        overflow-y: auto;
        position: absolute;
        bottom: 15vh;
        left: 10px;
        max-width: 50%;
        background-color: white;
        border-radius: 5px;
        box-shadow: 0 10px 16px 0 rgb(0 0 0 / 20%), 0 6px 20px 0 rgb(0 0 0 / 19%);

        div {
            padding: 10px;
        }
    }

    .margin-left {
        margin-left: 1em;
    }
</style>

<main>
    {#await loadPromise then _data }
        <iframe title="codenames iframe" src={tableUrl} />
        {#if informationIsOpen}
            <div class="pop-up">
                <div>
                    <h3>What is the goal?</h3>
                    <ol>
                        <li>Players split into 2 teams: Blue & Red, with each team assigning a Spymaster. Rest of the team are Field Operatives.</li>
                        <li>The Spymasters go in Spymaster mode in bottom right corner. Spymasters of each team can check agents’ team color hiding behind the codenames.</li>
                        <li>Spymasters must guide each team to guess the codenames of their team’s agents by providing a clue to them.</li>
                        <li>Teams use the clue to guess the right codenames related to their team’s agents</li>
                        <li>Winning team is the team that uncovers the identities of all their agents</li>
                    </ol>
                    <h3>Gameplay</h3>
                    <span>Teams take turns to do the following:</span>
                    <ol>
                        <li>The team’s Spymaster gives clues:</li>
                        <li class="margin-left">Spymaster selects the codenames he/she would like the field operatives to uncover</li>
                        <li class="margin-left">Spymaster gives a one-word clue and shouts out the number of codenames it relates to. This number will indicate the number of correct guesses the team can make for the turn. If the team makes a correct guess form previous clue, they are allowed 1 extra guess</li>
                        <li>Team’s field operatives guess the codenames to uncover:</li>
                        <li class="margin-left">Teammates discuss the clue and make a guess by touching one of the codenames on the table</li>
                        <li class="margin-left">If it uncovers an agent belonging to the team, they continue guessing until they uncover all codenames related to the clue</li>
                        <li>The turn is passed to the next team, if any of the guesses are wrong</li>
                        <li>Team loses if they uncover an Assassin card.</li>
                    </ol>
                </div>
            </div>
        {/if}
        <div class="bottom-bar">
            <Button importance="secondary" on:click={() => toggleInformation()}>
                <img class="icon-left" src="assets/Question-icon.png" alt="question-mark" />
                How to play
            </Button>
        </div>
    {/await}
</main>