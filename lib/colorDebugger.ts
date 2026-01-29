import { debugColorExtraction, extractPalette } from './colorAnalysis';

/**
 * Utility to help debug color extraction issues with specific photos
 * Use this in your browser console or add it to a test page
 */
export class ColorDebugger {
  /**
   * Analyze a photo and log detailed information
   */
  static async analyzePhoto(imageUrl: string, colorCount: number = 6) {
    try {
      console.log('🎨 Analyzing photo:', imageUrl);
      
      const debug = await debugColorExtraction(imageUrl, colorCount);
      
      console.log('📊 Image Analysis Results:');
      console.log(`Original size: ${debug.imageSize.width}x${debug.imageSize.height}`);
      console.log(`Processed size: ${debug.processedSize.width}x${debug.processedSize.height}`);
      console.log(`Total pixels analyzed: ${debug.totalPixels.toLocaleString()}`);
      console.log(`Unique colors found: ${debug.uniqueColors.toLocaleString()}`);
      console.log(`Color diversity: ${((debug.uniqueColors / debug.totalPixels) * 100).toFixed(2)}%`);
      
      console.log('\n🏆 Top 10 Most Frequent Colors:');
      debug.topColors.slice(0, 10).forEach((color, i) => {
        console.log(`${i + 1}. ${color.hex} - ${color.count} pixels (${color.percentage}%)`);
      });
      
      console.log('\n🎯 Extracted Palette:');
      debug.extractedColors.forEach((color, i) => {
        console.log(`${i + 1}. ${color.hex} - ${color.label} (H:${color.hsl.h}° S:${color.hsl.s}% L:${color.hsl.l}%)`);
      });
      
      // Check for potential issues
      console.log('\n🔍 Potential Issues:');
      
      if (debug.uniqueColors < colorCount * 2) {
        console.warn('⚠️ Low color diversity - image might be very monochromatic');
      }
      
      if (debug.topColors[0]?.percentage > 50) {
        console.warn('⚠️ One color dominates >50% of image - might miss subtle colors');
      }
      
      const hasVeryDarkColors = debug.extractedColors.some(c => c.hsl.l < 10);
      const hasVeryLightColors = debug.extractedColors.some(c => c.hsl.l > 90);
      if (hasVeryDarkColors && hasVeryLightColors) {
        console.warn('⚠️ High contrast image - might need different similarity thresholds');
      }
      
      const lowSatColors = debug.extractedColors.filter(c => c.hsl.s < 20).length;
      if (lowSatColors > colorCount * 0.6) {
        console.warn('⚠️ Many low-saturation colors - image might be washed out or grayscale');
      }
      
      return debug;
      
    } catch (error) {
      console.error('❌ Error analyzing photo:', error);
      throw error;
    }
  }
  
  /**
   * Compare old vs new extraction methods (if you want to test improvements)
   */
  static async compareExtractionMethods(imageUrl: string, colorCount: number = 6) {
    console.log('🔄 Comparing extraction methods for:', imageUrl);
    
    try {
      const newResults = await extractPalette(imageUrl, colorCount);
      console.log('✨ New method results:', newResults.map(c => c.hex));
      
      return { newResults };
    } catch (error) {
      console.error('❌ Error in comparison:', error);
      throw error;
    }
  }
  
  /**
   * Test multiple photos at once
   */
  static async batchAnalyze(imageUrls: string[], colorCount: number = 6) {
    console.log(`🔄 Batch analyzing ${imageUrls.length} photos...`);
    
    const results = [];
    for (let i = 0; i < imageUrls.length; i++) {
      console.log(`\n📸 Photo ${i + 1}/${imageUrls.length}:`);
      try {
        const result = await this.analyzePhoto(imageUrls[i], colorCount);
        results.push({ url: imageUrls[i], success: true, result });
      } catch (error) {
        console.error(`❌ Failed to analyze photo ${i + 1}:`, error);
        results.push({ url: imageUrls[i], success: false, error });
      }
    }
    
    console.log('\n📋 Batch Analysis Summary:');
    const successful = results.filter(r => r.success).length;
    console.log(`✅ Successful: ${successful}/${imageUrls.length}`);
    console.log(`❌ Failed: ${imageUrls.length - successful}/${imageUrls.length}`);
    
    return results;
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).ColorDebugger = ColorDebugger;
}