// composables/useMarkdown.ts
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'

marked.setOptions({
	breaks: true,
	gfm: true,
	highlight: (code: string, lang: string) => {
		try {
			if (lang && hljs.getLanguage(lang)) {
				return hljs.highlight(code, { language: lang }).value
			}
			return hljs.highlightAuto(code).value
		} catch (err) {
			return code
		}
	},
})

export const useMarkdown = () => {
	/**
	 * 마크다운을 HTML로 변환
	 */
	const toHtml = (markdown: string): string => {
		try {
			return marked.parse(markdown) as string
		} catch (error) {
			console.error('마크다운 파싱 에러:', error)
			return `<p>마크다운 파싱 중 오류가 발생했습니다.</p>`
		}
	}

	/**
	 * 마크다운에서 제목 추출 (TOC 생성용)
	 */
	const extractHeadings = (markdown: string): Array<{ level: number; text: string; id: string }> => {
		const headings: Array<{ level: number; text: string; id: string }> = []
		const lines = markdown.split('\n')

		lines.forEach((line) => {
			const match = line.match(/^(#+)\s+(.+)$/)
			if (match) {
				const level = match[1].length
				const text = match[2]
				const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
				headings.push({ level, text, id })
			}
		})

		return headings
	}

	/**
	 * 단어 수 계산
	 */
	const getWordCount = (markdown: string): number => {
		return markdown.trim().split(/\s+/).length
	}

	/**
	 * 예상 읽기 시간 (분 단위, 분당 200단어 기준)
	 */
	const getReadingTime = (markdown: string): number => {
		const words = getWordCount(markdown)
		return Math.ceil(words / 200)
	}
	
  const parseTemplate = (format: string, item: Record<string, any>): string => {
    if (!format || !item) return ''
    
    let result = format.replace(/\n|\t/gi, '')
    
    // $[key] 형태 처리 ($ 기호는 그대로 유지)
    result = result.replace(/\$\[(\w+)\]/g, (match, key) => {
      return item[key] !== undefined ? `$${item[key]}` : ''; // match
    })
    
    // [key] 형태 처리
    result = result.replace(/\[(\w+)\]/g, (match, key) => {
      return item[key] !== undefined ? String(item[key]) : ''; //match
    })
    
    // {key} 형태 처리 (옵션)
    result = result.replace(/\{(\w+)\}/g, (match, key) => {
      return item[key] !== undefined ? String(item[key]) : ''; //match
    })
    
    return result
  }
  /**
   * 셀 값 추출 (링크 및 이미지 처리)
   */
  const getCellValue = (
    item: any, 
    opt: { 
      cell: string | string[]; 
      link?: string | ((item: any, baseUrl: string) => string);
      image?: boolean;
      imageSize?: { width?: number; height?: number };
    },
    baseUrl: string = 'https://medalbank.com'
  ): string => {
    const { cell, link, image, imageSize } = opt;
    const cellStr = Array.isArray(cell) ? cell.join('') : cell;

    // 기본 값 추출
    let value = '';
    value = parseTemplate(cellStr, item);

    // 이미지 처리
    if (image) {
      const imageUrl = value || item.featured || '';
      if (imageUrl) {
        const width = imageSize?.width || 80;
        const height = imageSize?.height || 80;
        
        // 여백 없이 꽉 차는 이미지
        return `<img src="${imageUrl}" width="${width}" height="${height}" style="display: block; width: ${width}px; height: ${height}px; object-fit: cover; margin: 0; padding: 0;" />`;
      }
      return '';
    }

    // 링크 처리
    if (link) {
      let url = '';
      if (typeof link === 'function') {
        url = link(item, baseUrl);
      } else {
        url = link.replace(':id', item.athleteID || item.id);
        if (!url.startsWith('http')) {
          url = `${baseUrl}${url}`;
        }
      }
      return `[${value}](${url})`;
    }

    return value;
  };
  const getCellValue1 = (
    item: any, 
    opt: { 
      cell: string | string[]; 
      link?: string | ((item: any, baseUrl: string) => string);
      image?: boolean;
      imageSize?: { width?: number; height?: number };
    },
    baseUrl: string = 'https://medalbank.com'
  ): string => {
    const { cell, link, image, imageSize } = opt;

    // 기본 값 추출
    let value = '';
    if (typeof cell === 'string') {
      value = item[cell.replace(/\[|\]/g, '')] !== undefined ? String(item[cell.replace(/\[|\]/g, '')]) : '';
    } else if (Array.isArray(cell)) {
      value = cell.map(part => {
        if (item[part.replace(/\[|\]/g, '')] == undefined) {
          return part;
        }
        return item[part.replace(/\[|\]/g, '')] !== undefined ? String(item[part.replace(/\[|\]/g, '')]) : '';
      }).join('');
    }

    // 이미지 처리
    if (image) {
      const imageUrl = value || item.featured || '';
      if (imageUrl) {
        const width = imageSize?.width || 80;
        const height = imageSize?.height || 80;
        
        // 여백 없이 꽉 차는 이미지
        return `<img src="${imageUrl}" width="${width}" height="${height}" style="display: block; width: ${width}px; height: ${height}px; object-fit: cover; margin: 0; padding: 0;" />`;
      }
      return '';
    }

    // 링크 처리
    if (link) {
      let url = '';
      if (typeof link === 'function') {
        url = link(item, baseUrl);
      } else {
        url = link.replace(':id', item.athleteID || item.id);
        if (!url.startsWith('http')) {
          url = `${baseUrl}${url}`;
        }
      }
      return `[${value}](${url})`;
    }

    return value;
  };

  /**
   * Markdown 테이블 생성
   */
  const generateMarkdownTable = (
    times: any[], 
    options: { 
      header: string; 
      cell: string | string[]; 
      link?: string | ((item: any, baseUrl: string) => string);
      image?: boolean;
      imageSize?: { width?: number; height?: number };
    }[],
    baseUrl: string = 'https://breaststroke.club'
  ): string => {
    if (!times || times.length === 0) {
      return '보다 정확한 결과를 제공하기 위해 데이터를 준비 중입니다. 잠시만 기다려 주세요.';
    }

    // 헤더
    const headers = options.map(opt => opt.header).join('|');
    const separator = options.map(() => '---').join('|');

    // 데이터 행
    const rows = times.map(item => {
      const cells = options.map(opt => getCellValue(item, opt, baseUrl));
      return cells.join(' | ');
    });

    return `| ${headers} |\n|${separator}|\r\n${rows.map(row => `| ${row} |`).join('\n')}`;
  };

	return {
		toHtml,
		extractHeadings,
		getWordCount,
		getReadingTime,
		generateMarkdownTable,
	}
}