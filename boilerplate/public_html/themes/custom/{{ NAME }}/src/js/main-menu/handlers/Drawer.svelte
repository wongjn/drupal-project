<script>
import 'Drupal'; // Ensure Drupal is imported for Drupal.t() calls.
import { createEventDispatcher, onDestroy } from 'svelte';
import { fade, fly, scale, slide } from 'svelte/transition';
import { circInOut } from 'svelte/easing';
import { toggleScrolling } from '../../lib/dom';
import { focusTrap } from '../../lib/svelte';

// Base URL for the site.
export let baseUrl = '/';

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

const flyParams = { duration: 300, y: 30 };
const scaleParams = { duration: 300, start: 0.6 };
</script>

<svelte:body on:keydown={escClose}/>

{#if open}
  <div
    id="drawer-menu"
    class="wrapper"
    style={offsetStyles}
    use:focusTrap={{ trap: open }}
    on:click={linkClose}
  >
    <div class="main">
      <header>
        <a href={baseUrl}>
          <img
            src="{baseUrl}themes/custom/{{ name }}/logo.svg"
            width=""
            height=""
            alt={window.Drupal.t('Home')}
            transition:fade={{ duration: 400 }}
          />
        </a>
        <h2
          tabIndex="-1"
          bind:this={titleElement}
          in:fly={{ ...flyParams, delay: 200 }}
          out:fly={flyParams}
        >
          {window.Drupal.t('Full Menu')}
        </h2>
        <button
          aria-controls="drawer-menu"
          on:click|stopPropagation={dispatchClose}
          in:scale={{ ...scaleParams, delay: 100 }}
          out:scale={scaleParams}
        >
          {window.Drupal.t('Close full menu')}
        </button>
      </header>
      <div class="menu" in:fly={{ ...flyParams, delay: 300 }} out:fly={flyParams}>
        {@html clonedMenu}
      </div>
      <div class="background" transition:slide={{ duration: 400, easing: circInOut }} on:outroend/>
    </div>
    <div class="background" transition:fade={{ duration: 400 }} on:click|stopPropagation={dispatchClose}/>
  </div>
{/if}

<style lang="scss">
@use 'sass:selector';
@use '../../../sass/lib/colors';
@use '../../../sass/lib/easing';
@use '../../../sass/lib/font';
@use '../../../sass/lib/layout';

$title_size: 1.5em;

.wrapper {
  @include font.size(24);
  position: fixed;
  z-index: 500;
  color: #fff;

  :global(body[style*="overflow: hidden"]) & {
    padding-right: var(--body-scrollbar-width, 0px);
  }
}

.background {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  background-color: rgba(#000, 0.8);
  transform-origin: top;

  .main & {
    background-color: royalblue;
  }
}

.main {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  padding: 0 layout.$GUTTER_FALLBACK_PX;
  padding: 0 var(--site-gutter);
  max-width: (layout.$SITE-WIDTH-PX + (layout.$GUTTER_FALLBACK_PX * 2));
  max-width: calc(#{layout.$SITE-WIDTH-PX} + (var(--site-gutter) * 2));
  max-height: 100%;
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 0 0 auto;
  height: 90px; // Matches height of header bar.
}

// Hide using visibility so that it is still involved in layout for the parent
// `justify-content: space-between` so that the button remains on the right.
a {
  visibility: hidden;

  @media (min-width: 320px) {
    visibility: visible;
  }
}

h2 {
  display: none;
  font-weight: 700;
  line-height: 1;

  @media (min-width: 640px) {
    display: block;
  }

  &:focus:not(:focus-visible) {
    outline: 0;
  }
}

button {
  position: relative;
  flex-shrink: 0;
  height: $title_size;
  width: $title_size;
  text-indent: -9999em;

  &::before,
  &::after {
    $line_width: 3px;

    position: absolute;
    top: calc(50% - #{$line_width / 2});
    left: 0;
    width: 100%;
    height: $line_width;
    background-color: currentColor;
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
    outline: 2px solid;
    outline-offset: 5px;
  }
  &:focus:not(:focus-visible) {
    outline: 0;
  }
  &:focus-visible {
    outline: 2px solid;
  }
}

.menu {
  margin-right: (layout.$GUTTER_FALLBACK_PX * -1);
  margin-right: calc(var(--site-gutter) * -1);
  padding-right: layout.$GUTTER_FALLBACK_PX;
  padding-right: var(--site-gutter);
  overflow-x: hidden;
  overflow-y: auto;
}

:global {
  .drawer {
    &__top-menu {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      margin-top: 2rem;
    }

    &__sub-menu {
      display: flex;
      flex-wrap: wrap;
      font-size: 0.8em;

      &--deep {
        display: block;
        border-left: 1px solid;
        padding-left: 1em;
        font-size: 1em;
      }
    }

    &__item {
      &--top {
        margin-left: (layout.$GUTTER_FALLBACK_PX * 2);
        margin-left: calc(var(--site-gutter) * 2);
        margin-bottom: 2rem;
      }

      &--sub {
        margin-top: 1rem;
        min-width: 0;
        overflow: hidden;
      }
    }

    &__link {
      color: inherit;

      &--top {
        font-weight: 700;
      }
    }
  }
}
</style>
