<script lang="ts">
  import { useDarkMode } from '$lib/utilities/dark-mode';

  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();

  let fill = $derived($useDarkMode ? 'black' : 'white');
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width="290"
  height="221"
  viewBox="0 0 290 221"
  fill="none"
  class={className}
  role="img"
  aria-hidden="true"
>
  <title></title>
  <path
    d="M207.5 27.5H146.5V185.5H207.5V27.5Z"
    fill="currentColor"
    stroke="currentColor"
  />
  <path d="M267 7V166H168V7H267Z" {fill} stroke="currentColor" />
  <path d="M289.5 178.5H219.5V220.46H289.5V178.5Z" {fill} />
  <path
    d="M289.393 216.5V220.5H286.454"
    stroke="currentColor"
    stroke-miterlimit="10"
  />
  <path
    d="M278.889 220.5H226.495"
    stroke="currentColor"
    stroke-miterlimit="10"
    stroke-dasharray="8.51 10.64"
  />
  <path
    d="M222.439 220.5H219.5V216.5"
    stroke="currentColor"
    stroke-miterlimit="10"
  />
  <path
    d="M219.5 204.27V188.5"
    stroke="currentColor"
    stroke-miterlimit="10"
    stroke-dasharray="9.7 12.13"
  />
  <path
    d="M219.5 182.5V178.5H222.439"
    stroke="currentColor"
    stroke-miterlimit="10"
  />
  <path
    d="M230.493 178.5H282.886"
    stroke="currentColor"
    stroke-miterlimit="10"
    stroke-dasharray="8.51 10.64"
  />
  <path
    d="M286.454 178.5H289.393V182.5"
    stroke="currentColor"
    stroke-miterlimit="10"
  />
  <path
    d="M289.452 194.5V210.27"
    stroke="currentColor"
    stroke-miterlimit="10"
    stroke-dasharray="9.7 12.13"
  />
  <path d="M187.5 6.5V166.5V6.5Z" {fill} />
  <path d="M187.5 6.5V166.5" stroke="currentColor" stroke-miterlimit="10" />
  <path d="M207.5 6.5V166.5V6.5Z" {fill} />
  <path d="M207.5 6.5V166.5" stroke="currentColor" stroke-miterlimit="10" />
  <path d="M227.5 6.5V166.5V6.5Z" {fill} />
  <path d="M227.5 6.5V166.5" stroke="currentColor" stroke-miterlimit="10" />
  <path d="M247.5 6.5V166.5V6.5Z" {fill} />
  <path d="M247.5 6.5V166.5" stroke="currentColor" stroke-miterlimit="10" />
  <path d="M267.5 27.5H167.5H267.5Z" {fill} />
  <path d="M267.5 27.5H167.5" stroke="currentColor" stroke-miterlimit="10" />
  <path d="M267.5 47.5H167.5H267.5Z" {fill} />
  <path d="M267.5 47.5H167.5" stroke="currentColor" stroke-miterlimit="10" />
  <path d="M267.5 67.5H167.5H267.5Z" {fill} />
  <path d="M267.5 67.5H167.5" stroke="currentColor" stroke-miterlimit="10" />
  <path d="M267.5 87.5H167.5H267.5Z" {fill} />
  <path d="M267.5 87.5H167.5" stroke="currentColor" stroke-miterlimit="10" />
  <path d="M267.5 107.5H167.5H267.5Z" {fill} />
  <path d="M267.5 107.5H167.5" stroke="currentColor" stroke-miterlimit="10" />
  <path d="M267.5 127.5H167.5H267.5Z" {fill} />
  <path d="M267.5 127.5H167.5" stroke="currentColor" stroke-miterlimit="10" />
  <path d="M267.5 147.5H167.5H267.5Z" {fill} />
  <path d="M267.5 147.5H167.5" stroke="currentColor" stroke-miterlimit="10" />
  <path d="M289.5 47.5H279.5V57.5H289.5V47.5Z" fill="currentColor" />
  <path d="M289.5 69.5H279.5V79.5H289.5V69.5Z" fill="currentColor" />
  <path d="M289.5 91.5H279.5V101.5H289.5V91.5Z" fill="currentColor" />
  <path d="M289.5 113.5H279.5V123.5H289.5V113.5Z" fill="currentColor" />
  <path
    d="M289.5 134.5H279.5V144.5H289.5V134.5Z"
    {fill}
    stroke="currentColor"
    stroke-miterlimit="10"
  />
  <path
    d="M289.5 156.5H279.5V166.5H289.5V156.5Z"
    {fill}
    stroke="currentColor"
    stroke-miterlimit="10"
  />
  <path d="M42.5 36.5H32.5V46.5H42.5V36.5Z" fill="currentColor" />
  <path
    d="M42.5 58.5H32.5V68.5H42.5V58.5Z"
    {fill}
    stroke="currentColor"
    stroke-miterlimit="10"
  />
  <path
    d="M42.5 80.5H32.5V90.5H42.5V80.5Z"
    {fill}
    stroke="currentColor"
    stroke-miterlimit="10"
  />
  <path
    d="M42.5 102.5H32.5V112.5H42.5V102.5Z"
    {fill}
    stroke="currentColor"
    stroke-miterlimit="10"
  />
  <path
    d="M47.5 6.5C47.5 3.18629 44.8137 0.5 41.5 0.5C38.1863 0.5 35.5 3.18629 35.5 6.5C35.5 9.81371 38.1863 12.5 41.5 12.5C44.8137 12.5 47.5 9.81371 47.5 6.5Z"
    {fill}
    stroke="currentColor"
    stroke-miterlimit="10"
  />
  <path
    d="M69.5 6.5C69.5 3.18629 66.8137 0.5 63.5 0.5C60.1863 0.5 57.5 3.18629 57.5 6.5C57.5 9.81371 60.1863 12.5 63.5 12.5C66.8137 12.5 69.5 9.81371 69.5 6.5Z"
    {fill}
    stroke="currentColor"
    stroke-miterlimit="10"
  />
  <path
    d="M64.5 34.2808C64.5 33.2994 65.2843 32.5 66.2474 32.5H214.753C215.716 32.5 216.5 33.2994 216.5 34.2808V120.5H64.5V34.2808Z"
    {fill}
    stroke="currentColor"
    stroke-miterlimit="10"
  />
  <path
    d="M211.5 36.5H69.5C68.9477 36.5 68.5 36.9477 68.5 37.5V115.5C68.5 116.052 68.9477 116.5 69.5 116.5H211.5C212.052 116.5 212.5 116.052 212.5 115.5V37.5C212.5 36.9477 212.052 36.5 211.5 36.5Z"
    {fill}
    stroke="currentColor"
    stroke-miterlimit="10"
  />
  <path
    d="M225.5 129.5H55.5V137.5H225.5V129.5Z"
    {fill}
    stroke="currentColor"
    stroke-linejoin="round"
  />
  <path
    d="M55.5 129.5L64.7079 120.605L216.183 120.5L225.5 129.5H55.5Z"
    {fill}
    stroke="currentColor"
    stroke-linejoin="round"
  />
  <path d="M136.5 63.5H132.5V69.5H136.5V63.5Z" fill="currentColor" />
  <path d="M150.5 63.5H146.5V69.5H150.5V63.5Z" fill="currentColor" />
  <path d="M132.5 83.5H128.5V87.5H132.5V83.5Z" fill="currentColor" />
  <path d="M154.5 83.5H150.5V87.5H154.5V83.5Z" fill="currentColor" />
  <path d="M150.5 87.5H132.5V91.5H150.5V87.5Z" fill="currentColor" />
  <path d="M128.5 79.5H124.5V83.5H128.5V79.5Z" fill="currentColor" />
  <path d="M158.5 79.5H154.5V83.5H158.5V79.5Z" fill="currentColor" />
  <path
    d="M42.5 120.5H0.5V162.5H42.5V120.5Z"
    {fill}
    stroke="currentColor"
    stroke-miterlimit="10"
  />
  <path d="M52.5 130.5H10.5V172.5H52.5V130.5Z" fill="currentColor" />
  <path
    d="M38.375 150.5V151H43.625V150.5H48.875V151H54.125V150.5H59.375V151H64.625V150.5H69.875V151H72V153.125H72.5V158.375H72V163.625H72.5V168.875H72V174.125H72.5V179.375H72V184.625H72.5V189.875H72V192H69.875V192.5H64.625V192H59.375V192.5H54.125V192H48.875V192.5H43.625V192H38.375V192.5H33.125V192H31V189.875H30.5V184.625H31V179.375H30.5V174.125H31V168.875H30.5V163.625H31V158.375H30.5V153.125H31V151H33.125V150.5H38.375Z"
    stroke="currentColor"
    stroke-dasharray="6 6"
  />
  <path
    d="M62.5 140.5H20.5V182.5H62.5V140.5Z"
    {fill}
    stroke="currentColor"
    stroke-miterlimit="10"
  />
  <path d="M244.5 189.5H234.5V199.5H244.5V189.5Z" fill="currentColor" />
  <path d="M264.5 189.5H254.5V199.5H264.5V189.5Z" fill="currentColor" />
  <path d="M254.5 199.5H244.5V209.5H254.5V199.5Z" fill="currentColor" />
  <path d="M274.5 199.5H264.5V209.5H274.5V199.5Z" fill="currentColor" />
</svg>
