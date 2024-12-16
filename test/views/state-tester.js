import { html } from 'lit-html';
import { createState } from 'suunta';

export function StateTesterView() {
    const state = createState({
        name: 'World',
        user: {
            id: 12,
            name: 'User One',
            notes: ['Make food', 'Rewrite in Rust'],
            likedNotes: [{ likeTime: '2024-01-01', noteId: 1 }],
        },
    });

    // TODO: Test case where object was undefined and then set

    function updateName() {
        state.name = 'Matsu';
    }

    function updateUserId() {
        state.user.id = 345;
    }

    function updateUserName() {
        state.user.name = 'Foobar';
    }

    function replaceUserNotes() {
        state.user.notes = ['Eat food', 'Rewrite in Go'];
    }

    function addUserNote() {
        state.user.notes.push('Touch grass');
    }

    function replaceLikedNotes() {
        state.user.likedNotes = [
            { likeTime: '2024-02-02', noteId: 5 },
            { likeTime: '2024-03-03', noteId: 10 },
        ];
    }

    function addLikedNote() {
        state.user.likedNotes.push({ likeTime: '2024-04-04', noteId: 15 });
    }

    return () => html`
        <h2>Hello ${state.name}</h2>

        <div id="user-info">
            <p>User info</p>
            <ul>
                <li>${state.user.id}</li>
                <li>${state.user.name}</li>
                <ul>
                    ${state.user.notes.map(note => html`<li>${note}</li>`)}
                </ul>
                <ul>
                    ${state.user.likedNotes.map(
                        note =>
                            html`<ul>
                                <li>${note.likeTime}</li>
                                <li>${note.noteId}</li>
                            </ul>`,
                    )}
                </ul>
            </ul>
        </div>

        <button id="update-name" @click=${updateName}>Update</button>
        <button id="update-user-id" @click=${updateUserId}>Update</button>
        <button id="update-user-name" @click=${updateUserName}>Update</button>
        <button id="update-user-notes" @click=${replaceUserNotes}>Update</button>
        <button id="add-user-note" @click=${addUserNote}>Update</button>
        <button id="replace-user-liked-notes" @click=${replaceLikedNotes}>Update</button>
        <button id="add-user-liked-note" @click=${addLikedNote}>Update</button>
    `;
}
