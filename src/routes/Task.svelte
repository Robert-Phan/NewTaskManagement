

<script lang="ts">
	import { onMount } from 'svelte';
	import { taskData, allTags } from './taskData';
	import { format, parse } from 'date-fns';

	export let taskIdx: number;

	let taskInfo = $taskData[taskIdx];

	let justAfterTaskAdder = taskIdx == 0;
	let withSolidUpperBorder = justAfterTaskAdder ? '' : '';

	function propDefined<T extends number | string[] | Date | undefined>(
		subsect: T
	): subsect is NonNullable<T> {
		if (subsect instanceof Array && subsect.length === 0) return false;

		return subsect !== undefined;
	}

	let somePropDefined =
		propDefined(taskInfo.priority) || propDefined(taskInfo.tags) || propDefined(taskInfo.deadline);

	$: priorityText = propDefined(taskInfo.priority)
		? new Array(taskInfo.priority).fill('!').join('')
		: '?';

	$: tags = propDefined(taskInfo.tags) ? taskInfo.tags.map((tag) => `#${tag}`) : [];

	$: deadlineText = propDefined(taskInfo.deadline)
		? taskInfo.deadline.toString().substring(16, 24) === '00:00:00'
			? format(taskInfo.deadline, 'y-MM-dd')
			: format(taskInfo.deadline, 'y-MM-dd hh:mmaa')
		: 'Set Deadline';

	function removeTask() {
		$taskData = $taskData.toSpliced(taskIdx, 1);
	}

	let redundanceText: string = taskInfo.text;

	function changeTaskText(e: Event) {
		if ('key' in e && typeof e.key == 'string' && e.key != 'Enter') return;
		if (taskInfo.text == redundanceText) return;
		redundanceText = taskInfo.text;
		$taskData = $taskData;
	}

	let addMenuVisible = false;

	function chooseTagFromMenu(
		e: MouseEvent & {
			currentTarget: EventTarget & HTMLDivElement;
		}
	) {
		let text = e.currentTarget.innerText;

		if (taskInfo.tags === undefined) taskInfo.tags = [];
		if (taskInfo.tags.find((tag) => tag === text.substring(1)) !== undefined) return;

		taskInfo.tags = [...taskInfo.tags, text.substring(1)];

		$taskData = $taskData;

		addMenuVisible = false;
	}

	const menuOptions = ['Add New Tag', 'Set Deadline', 'Set Priority'];
	let menuWidth: number;

	let menuInputVisible = false;
	let menuInput: HTMLInputElement;

	let menuInputFunc: (
		e: KeyboardEvent & {
			currentTarget: EventTarget & HTMLDivElement;
		}
	) => void;

	function chooseMenuOption(
		e: MouseEvent & {
			currentTarget: EventTarget & HTMLDivElement;
		}
	) {
		let text = e.currentTarget.innerText;
		menuInput.style.width = `${menuWidth * 1.25}px`;

		if (text === menuOptions[0]) {
			menuInput.placeholder = 'Add new tag...';
			menuInputFunc = addTag;
		} else if (text == menuOptions[1]) {
			menuInput.placeholder = 'Set deadline...';
			menuInputFunc = setDeadline;
		} else if (text == menuOptions[2]) {
			menuInput.placeholder = 'Set priority...';
			menuInputFunc = setPriority;
		}
		menuInputVisible = true;
	}

	function setPriority(
		e: KeyboardEvent & {
			currentTarget: EventTarget & HTMLDivElement;
		}
	) {
		if (e.key != 'Enter') return;

		if (menuInput.value === undefined || menuInput.value === '') return;

		let priorityString = menuInput.value.trim();

		let priorityNum = parseInt(priorityString);

		if (Number.isNaN(priorityNum)) {
			priorityNum = priorityString
				.split('')
				.map((ch) => (ch === '!' ? 1 : 0))
				.reduce((sum, num) => (sum + num) as 0 | 1);
		}

		if (priorityNum !== 0) 
			taskInfo.priority = priorityNum;
		else
			taskInfo.priority = undefined

		$taskData = $taskData;
		hideMenu();
	}

	function addTag(
		e: KeyboardEvent & {
			currentTarget: EventTarget & HTMLDivElement;
		}
	) {
		if (e.key != 'Enter') return;

		if ($allTags.find((tag) => menuInput.value == tag) !== undefined) return;
		if (menuInput.value === undefined || menuInput.value === '') return;

		if (taskInfo.tags === undefined) taskInfo.tags = [];

		taskInfo.tags = [...taskInfo.tags, menuInput.value];
		$taskData = $taskData;

		hideMenu();
	}

	function setDeadline(
		e: KeyboardEvent & {
			currentTarget: EventTarget & HTMLDivElement;
		}
	) {
		if (e.key != 'Enter') return;

		let deadlineStr = menuInput.value.trim();
		let parsedDeadline = parseDatetime(deadlineStr);
		if (!parsedDeadline) return;

		taskInfo.deadline = parsedDeadline;
		$taskData = $taskData;

		hideMenu();
	}

	function parseDatetime(deadlineStr: string) {
		let dateFormats = [
			'dd',
			'MM',
			'MM/dd',
			'dd/MM',
			'MM-dd',
			'yyyy',
			'MM/yy',
			'MM/yyyy',
			'yyyy-MM',
			'MM/dd/yyyy',
			'MM/dd/yy',
			'dd/MM/yyyy',
			'dd/MM/yy',
			'yy-MM-dd',
			'yyyy-MM-dd'
		];
		let timeFormats = ['hh', 'hhaa', 'hh aa', 'HH', 'mm', 'hh:mm', 'hh:mmaa', 'hh:mm aa', 'HH:mm'];

		for (let timeForm of timeFormats) {
			let justTime = parse(deadlineStr, timeForm, new Date());
			if (!Number.isNaN(justTime.getTime())) return justTime;
		}

		for (let dateForm of dateFormats) {
			let justDate = parse(deadlineStr, dateForm, new Date());
			if (!Number.isNaN(justDate.getTime())) return justDate;

			for (let timeForm of timeFormats) {
				let dateTime = parse(deadlineStr, `${dateForm} ${timeForm}`, new Date());
				if (!Number.isNaN(dateTime.getTime())) return dateTime;
			}
		}
	}

	function removeTag(
		e: MouseEvent & {
			currentTarget: EventTarget & HTMLDivElement;
		}
	) {
		if (taskInfo.tags === undefined) return;

		let tagRemoved = e.currentTarget.innerText.substring(1);

		taskInfo.tags = taskInfo.tags.filter((tag) => tag !== tagRemoved);
		$taskData = $taskData;
	}

	function hideMenu() {
		addMenuVisible = false;
		menuInputVisible = false;
		menuInput.value = ''
	}

	function removeDeadline() {
		taskInfo.deadline = undefined;
		$taskData = $taskData;
	}

	function removePriority() {
		taskInfo.priority = undefined;
		$taskData = $taskData;

	}

	function taskComplete() {
		taskInfo.completed = true;
		$taskData = $taskData;
	}
</script>

<svelte:window on:click={hideMenu} />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="flex flex-col divide-y-2 divide-dashed divide-emerald-300 {withSolidUpperBorder}">
	<div class="flex flex-1 divide-x-2 divide-dotted divide-emerald-200">
		<div class="basis-[2.75rem] flex-initial self-auto flex" on:click={taskComplete}>
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
				class="lucide lucide-check-circle flex-1 self-center hover:cursor-pointer"
			>
				<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" />
			</svg>
		</div>
		<input
			type="text"
			name="TaskAdd"
			class="task rounded-br-lg"
			bind:value={taskInfo.text}
			on:keypress={changeTaskText}
			on:blur={changeTaskText}
		/>
		<div class="basis-[2.75rem] flex-initial self-auto flex" on:click={removeTask}>
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
				class="lucide lucide-trash flex-1 self-center hover:cursor-pointer"
				><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path
					d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
				/></svg
			>
		</div>
	</div>
	<!-- {#if showSubsect} -->
	<div class="flex divide-x-2 divide-dotted divide-emerald-200">
		{#if propDefined(taskInfo.priority)}
			<div class="basis-[2.75rem] flex flex-col items-center" on:click={removePriority}>
				<div
					class="bg-emerald-900 text-green-200 shadow-xl
						rounded-full text-center hover:cursor-pointer
						text-sm w-[1.75rem] my-1.5 py-1 px-1.5"
				>
					{priorityText}
				</div>
			</div>
		{/if}
		{#if propDefined(taskInfo.deadline)}
			<div class="flex flex-initial gap-x-1.5 px-1.5" on:click={removeDeadline}>
				<div
					class="shadow-xl bg-emerald-900 text-green-200
				rounded-lg hover:cursor-pointer
				text-sm w-fit my-1.5 py-1 px-1.5"
				>
					{deadlineText}
				</div>
			</div>
		{/if}
		<!-- {#if propDefined(taskInfo.tags)} -->
		<div class="flex flex-initial gap-x-1.5 px-1.5 text-sm">
			{#each tags as tag}
				<div
					class="shadow-xl bg-emerald-900 text-emerald-200
							rounded-full hover:cursor-pointer
							text-sm w-fit my-1.5 py-1 px-1.5"
					on:click={removeTag}
				>
					{tag}
				</div>
			{/each}
			<div class="flex relative" on:click|stopPropagation={() => (addMenuVisible = true)}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="rgb(6 78 59)"
					stroke="rgb(167 243 208)"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="lucide lucide-check-circle
					self-center hover:cursor-pointer relative
					shadow-xl text-sm my-[0.5rem] {!somePropDefined ? 'w-[2rem]' : ''}"
				>
					<circle cx="12" cy="12" r="10" stroke="rgb(6 78 59)" /><path d="M8 12h8" /><path
						d="M12 8v8"
					/>
				</svg>
				<div
					class="w-max text-sm absolute flex flex-col shadow-xl bg-emerald-600 rounded-lg
					divide-y divide-dotted divide-emerald-200
					{!somePropDefined ? 'left-[2rem]' : 'left-[1.75rem]'}
					{addMenuVisible ? '' : 'hidden'}"
					bind:clientWidth={menuWidth}
				>
					{#if !menuInputVisible}
						{#each menuOptions as option}
							<div
								class="py-1.5 px-2 text-sm font-medium
								first:rounded-t-lg last-of-type:rounded-b-lg
								bg-emerald-600 text-emerald-100
								hover:cursor-pointer hover:bg-emerald-800 transition-colors duration-200"
								on:click|stopPropagation={chooseMenuOption}
							>
								{option}
							</div>
						{/each}
						{#each $allTags as tag}
							<div
								class="py-1.5 px-2 text-sm font-medium
									last-of-type:rounded-b-lg
									bg-emerald-600 text-emerald-100
									hover:cursor-pointer hover:bg-emerald-800 transition-colors duration-200"
								on:click|stopPropagation={chooseTagFromMenu}
							>
								{`#${tag}`}
							</div>
						{/each}
					{/if}
					<input
						class="bg-emerald-600 text-emerald-100
						rounded-lg focus:outline-none placeholder:text-emerald-100
						text-sm font-medium py-1.5 px-2
						{menuInputVisible ? '' : 'hidden'}"
						bind:this={menuInput}
						on:keydown={menuInputFunc}
					/>
				</div>
			</div>
		</div>
		<!-- {/if} -->
	</div>
	<!-- {/if} -->
</div>

<style lang="postcss">
	.task {
		@apply py-2.5 px-3 flex-1;
		@apply focus:outline-none font-medium;
		@apply bg-emerald-700 text-emerald-100 placeholder:text-emerald-100;
	}
</style>
