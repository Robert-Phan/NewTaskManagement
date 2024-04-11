<script lang="ts">
	import Task from './Task.svelte';

	import ChangeServerTaskData from './shared.svelte';
	import { taskData } from './taskData';
	import type { PageData } from './$types';

	export let data: PageData;
	$taskData = data.taskData;

	let newTaskInput: string = '';

	function addTaskInputHandler(e: KeyboardEvent) {
		if (e.key == 'Enter') addTask();
	}

	async function addTask() {
		$taskData = [
			{
				completed: false,
				text: newTaskInput
			},
			...$taskData
		];
		newTaskInput = '';
	}
</script>

<ChangeServerTaskData />
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="h-full w-full absolute bg-emerald-900" id="background">
	<form
		action="POST"
		class="flex flex-col mt-2.5 mx-2.5
		divide-y-2 divide-solid divide-emerald-400
		bg-emerald-700 rounded-lg shadow-xl"
	>
		<div class="flex divide-x-2 divide-dotted divide-emerald-200">
			<div
				class="basis-[2.75rem] flex-initial self-auto flex hover:cursor-pointer"
				on:click={addTask}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="rgb(167 243 208)"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="lucide lucide-plus-circle flex-1 self-center"
				>
					<circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" />
				</svg>
			</div>
			<input
				type="text"
				name="TaskAdd"
				placeholder="Add new task here..."
				class="task-input rounded-tr-lg"
				on:keydown={addTaskInputHandler}
				bind:value={newTaskInput}
			/>
		</div>
		{#each $taskData as task, idx (task)}
			{#if !task.completed}
				<Task taskIdx={idx} />
			{/if}
		{/each}
	</form>
</div>

<style lang="postcss">
	.task-input {
		@apply py-2.5 px-3 flex-1;
		@apply focus:outline-none font-medium;
		@apply bg-emerald-700 text-emerald-100 placeholder:text-emerald-100;
	}
</style>
