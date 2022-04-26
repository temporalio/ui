import { notifications } from '$lib/stores/notifications';

export const fetchLatestUiVersion = async (
  request = fetch,
): Promise<string> => {
  const response = await request(
    'https://api.github.com/repos/temporalio/ui-server/releases',
  );
  const body = await response.json();

  if (!response.ok) {
    notifications.add('error', 'Unable to fetch latest UI release version');
    return;
  }

  let version = undefined;
  if (body.length > 0) {
    const { tag_name } = body[0];
    version = tag_name.replace('v', '');
  }

  return version;
};
