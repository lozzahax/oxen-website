import sanitize from '../utils/sanitize';
import { Element } from '../types/himalaya';

export interface IEmbed {
  title: string;
  url: string;
  description?: string;
  site_name?: string;
  image?: string;
}

function extractMetadata(html: string): IEmbed {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const himalaya = require('himalaya');
  html = html.trim();
  const nodes = himalaya.parse(html);
  const data: IEmbed = { title: '', url: '' };

  nodes.forEach((node: Element) => {
    if (node.type === 'element' && node.tagName === 'html') {
      const headNode = node.children.find((node: Element) => {
        if (node.type === 'element' && node.tagName === 'head') {
          return node.children;
        }
      });
      const metaNodes = headNode.children.filter((node: Element) => {
        if (node.type === 'element' && node.tagName === 'meta') {
          return node;
        }
      });
      metaNodes.forEach((node: Element) => {
        if (node.attributes.length > 2) return;
        const prop = node.attributes[0]?.value;
        let content = node.attributes[1]?.value;
        if (content) {
          content = sanitize(content);
        }
        switch (prop) {
          case 'title':
          case 'og:title':
            data.title = content ?? '';
            break;
          case 'description':
          case 'og:description':
            data.description = content;
            break;
          case 'og:url':
            data.url = content ?? '';
            break;
          case 'og:site_name':
            data.site_name = content;
            break;
          case 'og:image':
          case 'og:image:url':
            data.image = content;
            break;
          default:
            break;
        }
      });
    }
  });
  return data;
}

async function fetchMetadata(targetUrl: string): Promise<IEmbed> {
  const response = await fetch(targetUrl);
  const html = await response.text();
  const data = extractMetadata(html);
  return data;
}

// https://noembed.com/#supported-sites
export interface INoembed extends IEmbed {
  site_name: string;
  html: string;
  // below are not guaranteed to return
  // width?: Number;
  // cache_age?: string;
  // height?: Number | null;
  // type?: 'rich';
  // provider_url?: string;
  // author_url?: string;
  // author_name?: string;
  // version?: string;
}

export function isNoembed(object: unknown): object is INoembed {
  if (!object) return false;
  return Object.prototype.hasOwnProperty.call(object, 'html');
}

// fetch noembed data and render on client at run time.
// fallback is fetch and render metadata on server at build time
export async function fetchContent(
  targetUrl: string,
): Promise<IEmbed | INoembed> {
  const fetchUrl = `https://noembed.com/embed?url=${targetUrl}`;
  const response = await fetch(fetchUrl);
  let data = await response.json();

  if (data.error) {
    if (data.error === 'no matching providers found') {
      if (typeof window === 'undefined') {
        const content = await fetchMetadata(targetUrl);
        data = content;
        return data;
      }
    } else {
      console.error(
        `unknown error when fetching noembed data for ${targetUrl}`,
      );
    }
  }

  const content = convertToNoembed(data);
  return content;
}

function convertToNoembed(rawData: any): INoembed {
  return {
    title: sanitize(rawData.title),
    url: sanitize(rawData.url),
    site_name: sanitize(rawData.provider_name),
    html: sanitize(rawData.html),
  };
}
