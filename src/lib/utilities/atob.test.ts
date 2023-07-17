import { describe, expect, it } from 'vitest';

import { atob, base64DecodeUnicode } from './atob';

describe('base64DecodeUnicode', () => {
  it('should decode unicode characters', () => {
    const res = base64DecodeUnicode(
      'eyJIZXkiOiLooajjg53jgYJB6beXxZLDqe+8oumAjcOcw5/CqsSFw7HkuILjkIDwoICA0LLQv9Cw0LLQv9Cw0LLRhtGDNCDRhtGD0L/QutGDIOODuzoqOuODu+OCnOKAmSgg4pi7IM+JIOKYuyAp44CCIPCfkoEg8J+ZhSDwn5mGIPCfmYsg8J+ZjiDwn5mNINinINmE2K3Yr9mI2K8g2KPZiiDYqNi52K8sINmF2LnYp9mF2YTYqSDYqNmI2YTZhtiv2KfYjCDYp9mE2KXYt9mE2KfZgiDhmpPhmpDhmovhmpLhmoQgdsyfzJzMmMymzZ9vzLbMmcywzKBrw6jNmsyuzLrMqsy5zLHMpCDMlnTMnc2VzLPMo8y7zKrNnmjMvM2TzLLMpsyzzJjMsmXNh8yjzLDMpsyszY4gzKLMvMy7zLHMmGjNms2OzZnMnMyjzLLNhWnMpsyyzKPMsMykdsy7zY0gIiwiQXQiOiIyMDIyLTA1LTEwVDEwOjI2OjE4LjMzNjA3ODQ0MS0wNDowMCJ9',
    );
    expect(res).toEqual(
      '{"Hey":"表ポあA鷗ŒéＢ逍Üßªąñ丂㐀𠀀впавпавцу4 цупку ・:*:・゜’( ☻ ω ☻ )。 💁 🙅 🙆 🙋 🙎 🙍 ا لحدود أي بعد, معاملة بولندا، الإطلاق ᚓᚐᚋᚒᚄ v̟̜̘̦͟o̶̙̰̠kè͚̮̺̪̹̱̤ ̖t̝͕̳̣̻̪͞h̼͓̲̦̳̘̲e͇̣̰̦̬͎ ̢̼̻̱̘h͚͎͙̜̣̲ͅi̦̲̣̰̤v̻͍ ","At":"2022-05-10T10:26:18.336078441-04:00"}',
    );
  });

  it('should decode english characters', () => {
    const res = base64DecodeUnicode(
      'InJhaW5ib3cgc3RhdHVzZXMgZGYyZjgxIFRlcm1pbmF0ZWQi',
    );
    expect(res).toEqual('"rainbow statuses df2f81 Terminated"');
  });
});

describe('atob', () => {
  it('should decode unicode characters', () => {
    const res = atob(
      'eyJIZXkiOiLooajjg53jgYJB6beXxZLDqe+8oumAjcOcw5/CqsSFw7HkuILjkIDwoICA0LLQv9Cw0LLQv9Cw0LLRhtGDNCDRhtGD0L/QutGDIOODuzoqOuODu+OCnOKAmSgg4pi7IM+JIOKYuyAp44CCIPCfkoEg8J+ZhSDwn5mGIPCfmYsg8J+ZjiDwn5mNINinINmE2K3Yr9mI2K8g2KPZiiDYqNi52K8sINmF2LnYp9mF2YTYqSDYqNmI2YTZhtiv2KfYjCDYp9mE2KXYt9mE2KfZgiDhmpPhmpDhmovhmpLhmoQgdsyfzJzMmMymzZ9vzLbMmcywzKBrw6jNmsyuzLrMqsy5zLHMpCDMlnTMnc2VzLPMo8y7zKrNnmjMvM2TzLLMpsyzzJjMsmXNh8yjzLDMpsyszY4gzKLMvMy7zLHMmGjNms2OzZnMnMyjzLLNhWnMpsyyzKPMsMykdsy7zY0gIiwiQXQiOiIyMDIyLTA1LTEwVDEwOjI2OjE4LjMzNjA3ODQ0MS0wNDowMCJ9',
    );
    expect(res).toEqual(
      '{"Hey":"表ポあA鷗ŒéＢ逍Üßªąñ丂㐀𠀀впавпавцу4 цупку ・:*:・゜’( ☻ ω ☻ )。 💁 🙅 🙆 🙋 🙎 🙍 ا لحدود أي بعد, معاملة بولندا، الإطلاق ᚓᚐᚋᚒᚄ v̟̜̘̦͟o̶̙̰̠kè͚̮̺̪̹̱̤ ̖t̝͕̳̣̻̪͞h̼͓̲̦̳̘̲e͇̣̰̦̬͎ ̢̼̻̱̘h͚͎͙̜̣̲ͅi̦̲̣̰̤v̻͍ ","At":"2022-05-10T10:26:18.336078441-04:00"}',
    );
  });

  it('should decode english characters', () => {
    const res = atob('InJhaW5ib3cgc3RhdHVzZXMgZGYyZjgxIFRlcm1pbmF0ZWQi');
    expect(res).toEqual('"rainbow statuses df2f81 Terminated"');
  });

  it('should become a no-op if browser is set to false', () => {
    const res = atob('InJhaW5ib3cgc3RhdHVzZXMgZGYyZjgxIFRlcm1pbmF0ZWQi', false);
    expect(res).toEqual('InJhaW5ib3cgc3RhdHVzZXMgZGYyZjgxIFRlcm1pbmF0ZWQi');
  });
});
