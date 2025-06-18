import { html } from 'lit-html';
import { when } from 'lit-html/directives/when.js';
import { fetchPending, pendingApiResponse } from 'suunta/fetch';
import { createState } from 'suunta/state';

interface Pokemon {
    name: string;
    sprites: {
        front_default: string;
    };
}

function getPokemon() {
    const fetcher = fetchPending<Pokemon>('https://pokeapi.co/api/v2/pokemon/ditto');
    return fetcher();
}

export function RequestView() {
    const state = createState({
        loaded: false,
    });
    const pokemonRes = pendingApiResponse<Pokemon>(fetchPending<Pokemon>('https://pokeapi.co/api/v2/pokemon/ditto'), {
        onSuccess: res => {
            console.log('Onsuccess: ', res);
            state.loaded = true;
        },
    });

    return () => {
        const { loading, result: pokemon, success } = pokemonRes;

        return html`
            <div class="flex flex-col items-center justify-center h-full w-full gap-4">
                <h2 class="text-4xl">RequestView</h2>

                <p class="text-base font-bold">Loaded: ${state.loaded}</p>

                <h3 class="text-2xl">Original</h3>
                ${when(pokemonRes.loading, () => html` <p>Loading...</p> `)}
                ${when(
                    pokemonRes.success,
                    () => html`
                        <h2 class="text-xl">${pokemonRes.result.name}</h2>

                        <img src="${pokemonRes.result.sprites.front_default}" />
                        <p></p>
                    `,
                )}

                <h3 class="text-2xl">Spread</h3>
                ${when(loading, () => html` <p>Loading...</p> `)}
                ${when(
                    success,
                    () => html`
                        <h2 class="text-xl">${pokemon.name}</h2>

                        <img src="${pokemon.sprites.front_default}" />
                        <p></p>
                    `,
                )}
            </div>
        `;
    };
}
