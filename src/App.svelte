<script>
    import Chord from './Chord.svelte';
    import {computeNotes, computeChords} from './chordinator';
	import { onMount } from 'svelte';

    let chordName = "Am7";
    const tuning = [ "E", "A", "D", "G", "B", "E" ];
    
    $: notes = computeNotes(chordName);
    $: chords = computeChords(chordName, tuning);

    // handle scrolling
    let y;
    let headerElement;
    let threshold;

    onMount(() => {
        setTimeout(() => {
            threshold = headerElement.offsetTop;
        }, 1);
	});
</script>

<svelte:window bind:scrollY={y}/>

<div class="top-container">
  <img src="logo.png" alt="Chord'o'Mathics">
  <p>Guitar Chords from Mathematics</p>
</div>

<div class="header {y > threshold ? 'sticky' : ''}" bind:this={headerElement}>
    <h1>Enter chord name:</h1>
    <input bind:value={chordName}>
    <h2>Notes: {notes} {#if chords.length > 0}<span>({chords.length} Chords)</span>{/if}</h2>
</div>

<div class="content">
    {#each chords as chord}
    <Chord {chord}/>
    {/each}
</div>