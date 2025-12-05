import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { ApiResponse } from '@/types'

// Sample story content for testing
const SAMPLE_STORIES = [
  {
    title: "Emma's Magical Forest Adventure",
    content: `Once upon a time, in a magical forest filled with talking animals and sparkling trees, there lived a brave and curious little girl named Emma.

Emma loved exploring the forest every day. She would walk along the winding paths, listening to the birds sing their beautiful songs and watching the butterflies dance among the flowers.

One sunny morning, Emma discovered a tiny door hidden behind a large oak tree. The door was no bigger than her hand, but it shimmered with a golden light that made her heart skip with excitement.

"Hello?" Emma called out gently. "Is anyone there?"

To her surprise, the door opened slowly, and out came a tiny fairy with wings that sparkled like diamonds. The fairy's name was Luna, and she had been waiting for someone as brave and kind as Emma.

"Emma!" Luna exclaimed with joy. "I've been waiting for you! The forest needs your help. The magical flowers have stopped blooming, and without them, the forest is losing its color."

Emma's eyes widened with determination. "I'll help you, Luna! What do we need to do?"

Luna explained that they needed to find three special seeds: the Seed of Kindness, the Seed of Courage, and the Seed of Friendship. These seeds could only be found by someone with a pure heart.

Emma and Luna set off on their adventure. First, they met a sad little rabbit who had lost his way home. Emma showed kindness by helping the rabbit find his family, and as a reward, the rabbit gave them the Seed of Kindness.

Next, they came across a deep, dark cave. Inside, they found the Seed of Courage, but it was guarded by a friendly dragon who was just lonely. Emma showed courage by talking to the dragon and making a new friend. The dragon was so happy that he gave them the Seed of Courage.

Finally, they met a group of animals who were arguing. Emma helped them work together and share, showing the true meaning of friendship. The animals were so grateful that they gave Emma and Luna the Seed of Friendship.

With all three seeds in hand, Emma and Luna returned to the center of the forest. Emma planted the seeds with care, and as she did, beautiful flowers began to bloom everywhere! The forest came alive with colors - red roses, blue forget-me-nots, yellow sunflowers, and purple violets.

The animals cheered, and Luna gave Emma a magical flower crown that would always remind her of her brave adventure.

From that day forward, Emma knew that kindness, courage, and friendship were the most magical powers of all. And whenever she visited the forest, the flowers would bloom brighter just for her.

The end.`,
    childName: "Emma",
    adjectives: ["brave", "curious", "kind"],
    theme: "Adventure",
    moral: "Kindness, courage, and friendship are the most magical powers",
    hasImages: false,
  },
  {
    title: "Lucas and the Friendly Dragon",
    content: `In a kingdom far, far away, there lived a creative and imaginative boy named Lucas. Lucas loved to draw and tell stories, but he had never met a real dragon - until one day.

It was a bright Saturday morning when Lucas decided to explore the hills behind his house. As he climbed higher and higher, he heard a strange sound - like someone was crying.

Following the sound, Lucas discovered a cave. Inside, he found a young dragon with shimmering green scales, sitting all alone and looking very sad.

"Hello," Lucas said gently. "My name is Lucas. Why are you so sad?"

The dragon looked up with big, teary eyes. "My name is Sparkle," the dragon said. "I'm sad because everyone is afraid of me. They run away whenever they see me, and I have no friends."

Lucas smiled warmly. "I'm not afraid of you, Sparkle! You seem very friendly. Would you like to be my friend?"

Sparkle's eyes lit up with happiness. "Really? You want to be my friend?"

"Of course!" Lucas replied. "Friends help each other. Maybe we can show everyone that dragons can be friendly too!"

So Lucas and Sparkle came up with a plan. Lucas would draw pictures of Sparkle doing kind things - helping birds build nests, sharing flowers with children, and protecting the kingdom from storms.

They worked together all day, and Lucas created the most beautiful drawings. The next day, Lucas showed his drawings to everyone in the kingdom. At first, people were surprised, but as they looked at the pictures of Sparkle being kind and helpful, they began to understand.

"Maybe dragons aren't so scary after all," one person said.

"Sparkle looks very friendly!" another added.

Soon, the whole kingdom wanted to meet Sparkle. Lucas introduced his new friend to everyone, and Sparkle showed them that dragons could be gentle, kind, and helpful.

The king was so impressed that he made Sparkle the official protector of the kingdom. Sparkle would help during storms, rescue people who got lost, and even help farmers by warming their fields on cold days.

Lucas and Sparkle became the best of friends, and they showed everyone that friendship can happen between anyone - even between a boy and a dragon!

The end.`,
    childName: "Lucas",
    adjectives: ["creative", "imaginative", "friendly"],
    theme: "Friendship",
    moral: "Friendship can happen between anyone when we look past our differences",
    hasImages: true,
  },
  {
    title: "Sophia's Underwater Discovery",
    content: `Sophia was a determined and adventurous girl who loved the ocean. Every summer, she would spend hours at the beach, watching the waves and wondering what secrets lay beneath them.

One day, while swimming in the clear blue water, Sophia discovered something amazing - she could breathe underwater! It was as if the ocean itself had chosen her to be its special friend.

Excited and curious, Sophia dove deeper and deeper until she reached a beautiful underwater city. The city was made of colorful coral, and it was filled with friendly sea creatures of all shapes and sizes.

A wise old sea turtle named Captain Coral swam up to greet her. "Welcome, Sophia!" he said. "We've been waiting for someone like you. Our underwater world needs your help."

Sophia learned that a magical pearl that kept the ocean clean and healthy had been lost. Without it, the ocean was becoming polluted, and the sea creatures were worried.

"I'll help you find it!" Sophia declared with determination.

Captain Coral gave her a map that showed three clues. The first clue led her to a school of friendly dolphins who loved to play. They showed Sophia that the pearl was hidden where the sun's rays touched the ocean floor at noon.

The second clue came from a wise octopus who lived in a cave full of treasures. The octopus told Sophia that the pearl would only appear to someone with a pure heart who truly cared about the ocean.

The third clue was the most important - Sophia needed to work together with all the sea creatures to solve a puzzle that would reveal the pearl's location.

Sophia gathered all her new friends - the dolphins, the octopus, colorful fish, gentle sea horses, and even a friendly shark. Together, they solved the puzzle, and the magical pearl appeared in a beam of sunlight.

As soon as Sophia touched the pearl, the entire ocean began to sparkle and shine. The water became crystal clear, and all the sea creatures cheered with joy.

"Thank you, Sophia!" Captain Coral said. "You've saved our home. The ocean will always remember your kindness and determination."

Sophia returned to the surface, but she knew she could visit her underwater friends anytime. And from that day on, she became a protector of the ocean, teaching everyone she met about the importance of keeping our waters clean and protecting sea life.

The end.`,
    childName: "Sophia",
    adjectives: ["determined", "adventurous", "curious"],
    theme: "Discovery",
    moral: "Working together and caring for our environment makes the world a better place",
    hasImages: false,
  },
  {
    title: "Oliver's Space Journey",
    content: `Oliver was a clever and playful boy who dreamed of visiting the stars. Every night, he would look up at the sky and imagine what it would be like to travel through space.

One magical evening, as Oliver was stargazing from his bedroom window, a small, friendly spaceship landed right in his backyard! Out stepped a little alien named Zara, who had big, kind eyes and a warm smile.

"Hello, Earth child!" Zara said cheerfully. "I'm Zara from the planet Sparkle. I've come to ask for your help!"

Oliver was amazed but not afraid. "How can I help you?" he asked.

Zara explained that her planet was losing its sparkle because the stars that powered it were dimming. She needed someone clever and playful to help solve the mystery.

Oliver's eyes lit up with excitement. "I'd love to help! Let's go!"

So Oliver climbed into Zara's spaceship, and they zoomed off into space. The journey was incredible - they passed colorful planets, danced through asteroid fields, and even saw a comet up close!

When they arrived at Planet Sparkle, Oliver discovered that the stars were dimming because they were sad. The stars had lost their joy, and without joy, they couldn't shine brightly.

Oliver had a clever idea. He started playing games with the stars - hide and seek among the clouds, tag through the galaxy, and even a space dance party! The stars began to laugh and giggle, and as they did, they started to shine brighter and brighter.

Soon, the entire planet was glowing with beautiful, sparkling light. The stars were happy again, and Planet Sparkle was saved!

Zara was so grateful that she gave Oliver a special star-shaped badge that would let him visit Planet Sparkle anytime he wanted. "You've shown us that joy and playfulness are the most powerful magic of all!" Zara said.

Oliver returned home, but he knew he had made friends among the stars. And whenever he looked up at the night sky, he could see Planet Sparkle twinkling extra brightly, as if the stars were waving hello to their new friend.

The end.`,
    childName: "Oliver",
    adjectives: ["clever", "playful", "imaginative"],
    theme: "Fantasy",
    moral: "Joy and playfulness bring light and happiness to the world",
    hasImages: true,
  },
]

export async function POST(request: NextRequest) {
  const { userId, response } = await requireAuth(request)
  if (response) return response

  try {
    // Get user profile
    const { data: userProfile } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (!userProfile) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User profile not found',
        },
        { status: 404 }
      )
    }

    // Create sample stories
    const storiesToInsert = SAMPLE_STORIES.map((story) => ({
      user_id: userId,
      title: story.title,
      content: story.content,
      child_name: story.childName,
      adjectives: story.adjectives,
      theme: story.theme,
      moral: story.moral,
      has_images: story.hasImages,
      image_urls: story.hasImages ? [] : undefined,
    }))

    const { data: createdStories, error } = await supabaseAdmin
      .from('stories')
      .insert(storiesToInsert)
      .select()

    if (error) {
      throw error
    }

    return NextResponse.json<ApiResponse<{ count: number }>>({
      success: true,
      data: {
        count: createdStories?.length || 0,
      },
      message: `Successfully created ${createdStories?.length || 0} sample stories!`,
    })
  } catch (error) {
    console.error('Error seeding test data:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to seed test data',
      },
      { status: 500 }
    )
  }
}

