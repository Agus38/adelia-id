import { NextResponse } from 'next/server';
import archiver from 'archiver';
import { PassThrough } from 'stream';

// Function to set up and pipe the archive
async function createZipStream(): Promise<ReadableStream<Uint8Array>> {
  const archive = archiver('zip', {
    zlib: { level: 9 }, // Sets the compression level.
  });

  // Use a PassThrough stream to bridge archiver (Node.js stream) and ReadableStream (Web API)
  const stream = new PassThrough();
  archive.pipe(stream);

  // Define the source directory (project root)
  const sourceDir = process.cwd();

  // Define files and directories to ignore
  const ignore = [
    'node_modules/**',
    '.next/**',
    '.git/**',
    '*.zip', // Don't include previously created zip files
    '.env',
    '.env.local',
    'apphosting.yaml', // Often contains project-specific infra config
  ];

  // Add project files to the archive, respecting the ignore list
  archive.glob('**/*', {
    cwd: sourceDir,
    ignore: ignore,
    dot: true, // Include dotfiles (like .gitignore)
  });

  // Finalize the archive. This is an async operation.
  await archive.finalize();

  // Convert Node.js stream to Web Stream
  const webStream = new ReadableStream({
    start(controller) {
      stream.on('data', (chunk) => {
        controller.enqueue(chunk);
      });
      stream.on('end', () => {
        controller.close();
      });
      stream.on('error', (err) => {
        controller.error(err);
      });
    },
  });

  return webStream;
}

export async function GET() {
  try {
    const stream = await createZipStream();
    
    // Set headers for file download
    const headers = new Headers();
    headers.set('Content-Type', 'application/zip');
    headers.set('Content-Disposition', `attachment; filename="adelia-id-project.zip"`);

    return new Response(stream, { headers });

  } catch (error) {
    console.error('Failed to create project zip:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
