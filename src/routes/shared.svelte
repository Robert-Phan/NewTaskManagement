<script lang="ts" context="module">
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { taskData, allTags } from './taskData';

	onMount(() => {
		taskData.subscribe(async (data) => {
			let response = await fetch('/', {
				method: 'POST',
				body: JSON.stringify(data)
			});
		});
	});

	$: $allTags = [
		...new Set($taskData.filter((tInfo) => !tInfo.completed).flatMap((tInfo) => tInfo.tags ?? []))
	];
</script>
