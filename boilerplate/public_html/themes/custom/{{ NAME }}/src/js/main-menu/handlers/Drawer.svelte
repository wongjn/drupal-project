<script>
import { createEventDispatcher, onDestroy } from 'svelte';
import { fade, fly, scale } from 'svelte/transition';
import { toggleScrolling } from '../../lib/dom';
import { focusTrap } from '../../lib/svelte';

// Inject cloned menu.
export let menu;
$: clonedMenu = menu && menu.outerHTML
  // Replace main menu classes with drawer classes.
  .replace(/\bc-main-menu/g, 'drawer')
  // Remove any attributes from line break handler.
  .replace(/\b(aria-hidden|style)=".*?"/g, '');

// Deal with offsets from DrupalOffsets behavior.
export let offsets = {};
$: parsedOffsets = {
  top: offsets.top || 0,
  right: offsets.right || 0,
  bottom: offsets.bottom || 0,
  left: offsets.left || 0,
};
$: offsetStyles = Array.from(Object.entries(parsedOffsets))
  .map(([name, value]) => `${name}:${value}px`)
  .join(';');

// Open/close state.
export let open = false;

// Events.
const dispatch = createEventDispatcher();
const dispatchClose = () => dispatch('close');
// Send close event on esc key press.
const escClose = ({ key }) => open && key === 'Escape' && dispatchClose();
const linkClose = ({ target }) => (target.matches('a') || target.closest('a')) && dispatchClose();

// Focus title on open.
let titleElement;
$: open && titleElement && titleElement.focus();

// Toggle scrolling of the document.
$: toggleScrolling(open);

// Ensure scrolling is available again when destroying.
onDestroy(() => toggleScrolling(false));
</script>

<svelte:body on:keydown={escClose}/>

{#if open}
  <div
    id="drawer-menu"
    class="drawer"
    style={offsetStyles}
    transition:fade={{ duration: 300 }}
    use:focusTrap={{ trap: open }}
    on:outroend={() => dispatch('outroend')}
    on:click={linkClose}
  >
    <h2
      class="drawer__title"
      tabIndex="-1"
      bind:this={titleElement}
      transition:fly={{ duration: 300, y: -30 }}
    >
      {window.Drupal.t('Full Menu')}
    </h2>
    <button
      aria-controls="drawer-menu"
      class="drawer__close"
      on:click|stopPropagation={dispatchClose}
      transition:scale={{ duration: 300, start: 0.6 }}
    >
      {window.Drupal.t('Close full menu')}
    </button>
    <div class="drawer__menu" transition:fly={{ duration: 300, y: 30 }}>
      {@html clonedMenu}
    </div>
  </div>
{/if}

<style lang="scss">
@use '../../../sass/lib/unit';
@use '../../../sass/lib/easing';
@use '../../../sass/lib/font';

.drawer {
  $title-size: unit.px-to-rem(48);
  $title-padding: 2rem;

  display: flex;
  flex-direction: column;
  position: fixed;
  z-index: 500;

  &__title {
    background-color: skyblue;
    padding: $title-padding (($title-padding * 2) + $title-size) $title-padding $title-padding;
    flex: 0 0 auto;
    color: red;
    font-weight: 700;
    font-size: #{$title-size};
    text-transform: uppercase;
    outline: 0;
  }

  &__close {
    position: absolute;
    top: $title-padding;
    right: $title-padding;
    z-index: 3;
    height: $title-size;
    width: $title-size;
    font-size: 0;

    &::before,
    &::after {
      $line-width: 3px;

      position: absolute;
      top: calc(50% - #{$line-width / 2});
      left: 0;
      width: 100%;
      height: $line-width;
      background-color: blueviolet;
      transition: transform 600ms easing.get(in-out-cubic);
      content: '';
    }

    &::before {
      transform: rotateZ(45deg);
    }

    &::after {
      transform: rotateZ(-45deg);
    }

    &:hover,
    &:focus {
      &::before {
        transform: rotateZ(225deg);
      }

      &::after {
        transition-delay: 30ms;
        transform: rotateZ(135deg);
      }
    }
    &:focus {
      outline: 1px solid aqua;
    }
  }

  &__menu {
    @include font.size(48);
    overflow-x: hidden;
    overflow-y: auto;
    flex-grow: 1;
    background-color: lime;
  }
}

:global(.drawer__top-menu) {
  > :global(li) {
    border-bottom: 1px solid rgba(#fff, 0.2);
    padding: 1rem;
  }
}

:global(.drawer__sub-menu) {
  display: flex;
  flex-wrap: wrap;
  font-size: 0.6em;

  > :global(li) {
    background-color: rgba(#fff, 0.08);
    min-width: 0;
    margin: 1rem;
    overflow: hidden;
  }
}

:global(.drawer__sub-menu--deep) {
  display: block;
  font-size: 1em;

  > :global(li) {
    margin-top: 0;
  }
}

:global(.drawer__link) {
  display: table;
  color: inherit;
}

:global(.drawer__link--top) {
  text-transform: uppercase;
}

:global(.drawer__link-text) {
  background: linear-gradient(0deg, currentColor, currentColor) no-repeat bottom right / 0% 2px;
  transition: background-size 300ms;
  padding-bottom: 2px;

  :global(.drawer__link):focus > &,
  :global(.drawer__link):hover > & {
    background-position-x: left;
    background-size: 100% 2px;
  }
}
</style>
