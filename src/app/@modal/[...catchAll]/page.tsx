// Matches every URL the modal does not intercept, so soft-navigating away from
// an open modal replaces it with nothing instead of leaving it on screen.
export default function CatchAll() {
  return null;
}
