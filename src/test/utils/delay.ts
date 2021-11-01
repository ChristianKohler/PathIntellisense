export async function delay(delay: number) {
  return new Promise<void>((resolve) =>
    setTimeout(() => {
      resolve();
    }, delay)
  );
}
