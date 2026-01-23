# Plan: Card UI Refactor - Background Logo & Roadmap Link

## Goal
Refactor the `Flashcard.tsx` and `DetailedCard.tsx` components to enhance the visual hierarchy. This includes moving the language logo to a low-opacity background watermark and adding persistent roadmap/source linking.

## Proposed Changes

### 1. Backend & Data Layer
- **Models**: Add `roadmap_id` and `roadmap_title` to the `Card` model in `backend/app/models.py`.
- **Schemas**: Update Pydantic and Zod schemas in `schemas.py` and `frontend/src/lib/api.ts` to support these fields.
- **Generator**: Update `NodeDetailDrawer.tsx` to pass roadmap metadata when generating new cards.

### 2. Frontend Component: `Flashcard.tsx`
- **Background Logo**:
    - Remove the `Devicon` from the current header flexbox.
    - Add a `Devicon` with `size={160}` and `opacity-[0.08]` in an `absolute` container at the top-right corner.
    - Apply `rotate-12` and `pointer-events-none`.
- **Header Section**:
    - Title will span the full width.
    - Roadmap link (Breadcrumb) and Tags will appear below the title **only after reveal**.
    - If no roadmap is present, fallback to "Manual Entry" or the Deck name.

### 3. Frontend Component: `DetailedCard.tsx`
- **Background Logo**:
    - Implement the same absolute top-right watermark strategy as `Flashcard.tsx`.
- **Header Section**:
    - Remove the language icon container.
    - Display the full title and roadmap breadcrumb link.
    - Ensure the "Edit/Delete" dropdown menu has a higher `z-index` than the watermark.

### 4. Styles & Assets
- **Devicon**: Use original brand colors for the watermark.
- **Typography**: Maintain Geist Sans for titles and JetBrains Mono for code.

## Verification Plan
1. **Visual Check**: Open a study session and verify the logo watermark is subtle and correctly positioned.
2. **Recall Check**: Ensure the roadmap link remains hidden until the card is clicked.
3. **Library Check**: Verify that `DetailedCard` displays the breadcrumb link correctly and handles tag wrapping.
4. **Data Integrity**: Verify that newly generated AI cards correctly store and display their source roadmap.
