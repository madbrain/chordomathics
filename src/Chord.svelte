<script>
import * as _ from "lodash";

export let chord = {
    name: "D#m",
    stringTop: [
        "muted", "", "", "", "", ""
    ],
    fingers: [
        { number: 1, case: 6, from: 2, to: 6 },
        { number: 2, case: 7, from: 5 },
        { number: 3, case: 8, from: 3 },
        { number: 4, case: 8, from: 4 }
    ]
};

const margin = 10;
const topHeight = 10;
const leftSpace = 20;
const bottomSpace = 30;
const stringSpace = 20;
const caseSpace = 30;
const stringCount = chord.stringTop.length;

const minCase = _.min(_.map(chord.fingers, x => x.case));
const maxCase = _.max(_.map(chord.fingers, x => x.case));
const caseTop = _.max([minCase - 1, 1]);
const caseCount = maxCase - caseTop + 2;
</script>

<svg width={margin * 2 + stringCount * stringSpace + leftSpace}
    height={margin * 2 + caseCount * caseSpace + topHeight + bottomSpace}>
<g transform="translate({margin+leftSpace}, {margin})">
    {#each chord.stringTop as string, index}
    {#if string == "muted" || string == "open"}
    <text x={index * stringSpace} y="3" text-anchor="middle">{#if string == "muted"}x{:else if string == "open"}o{/if}</text>
    {/if}
    {/each}
</g>
{#if caseTop != 1}
<g transform="translate({margin}, {margin+topHeight})">
    <text x="{leftSpace-stringSpace*2/3}" y="{(minCase - caseTop) * caseSpace + caseSpace / 2}" text-anchor="end" fill="black" dy="5">{minCase}</text>
</g>
{/if}
<g transform="translate({margin + leftSpace}, {margin + caseCount * caseSpace + topHeight})">
    <text x={(stringCount-1) * stringSpace / 2} y={bottomSpace}
        text-anchor="middle" fill="black" font-size="25px">{chord.name}</text>
</g>
<g transform="translate({margin+leftSpace}, {margin+topHeight})">
    {#each _.range(stringCount) as string}
    <line x1={string * stringSpace} y1="0"
        x2={string * stringSpace} y2="{caseSpace * caseCount}"
        stroke="black"
        stroke-width={2+1/(string+1)}/>
    {/each}
    {#each _.range(caseCount+1) as c, index}
    <line x1="0" y1={c * caseSpace}
        x2={stringSpace * (stringCount-1)} y2={c * caseSpace}
        stroke-linecap="round"
        stroke="black"
        stroke-width={index == 0 && caseTop == 1 ? 6 : 1}/>
    {/each}
</g>
<g transform="translate({margin+leftSpace}, {margin+topHeight})">
    {#each chord.fingers as finger}
    {#if finger.to && finger.from != finger.to}
    <rect x={(finger.from-1) * stringSpace - stringSpace / 2} y={(finger.case-caseTop) * caseSpace + (caseSpace-stringSpace) / 2}
        width="{(finger.to-finger.from+1)*stringSpace}" height={stringSpace} rx={stringSpace/2} ry={stringSpace/2} />
    <text x={(finger.from-1+(finger.to-finger.from)/2) * stringSpace} y={(finger.case-caseTop + 0.5) * caseSpace}
        text-anchor="middle" fill="lightgreen" font-size="15px" dy="5">{finger.number}</text>
    {:else}
    <circle cx={(finger.from-1) * stringSpace} cy={(finger.case-caseTop + 0.5) * caseSpace}
        r={stringSpace/2} style="fill:black"/>
    <text x={(finger.from-1) * stringSpace} y={(finger.case-caseTop) * caseSpace + caseSpace / 2}
        text-anchor="middle" fill="lightgreen" font-size="15px" dy="5">{finger.number}</text>
    {/if}
    {/each}
</g>
</svg>